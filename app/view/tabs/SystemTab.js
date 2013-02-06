Ext.define('Onc.view.tabs.SystemTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computesystemtab',

    defaults: {
        xtype: 'fieldset',
        margin: '5 5 5 10'
    },
    autoScroll: true,

    envTags: ['label:Infrastructure', 'label:Staging', 'label:Development', 'label:Production'],


    initComponent: function() {
        var rec = this.record;
        this.addEvents('vmsstart', 'vmsstop', 'vmssuspend', 'vmsgraceful', 'vmedit');

        this.items = [{
            title: 'System Control',
            layout: 'hbox',
            items: [Ext.widget('computestatecontrol', {
                enableText: true,
                enableBorders: true,
                defaults: {
                    margin: '0 3 0 0'
                },
                disableDetails: true,
                disableHost: false,
                compute: rec
            }), {
                xtype: 'container',
                cls: 'computestatecontrol',
                items: {
                    xtype: 'button',
                    itemId: 'zabbix-button',
                    hidden: !ENABLE_ZABBIX,
                    scale: 'large',
                    icon: 'img/icon/zabbix.png',
                    iconAlign: 'top',
                    tooltip: 'Zabbix registration',
                    text: 'Zabbix',
                    frame: false
                }
            }]
        }, {
            title: 'Info',
            layout: {type: 'table', columns: 2},
            frame: true,
            defaults: {
                xtype: 'box',
                padding: 5
            },
            items: [
                {html: 'CPU info'}, {style: "font-weight: bold", html: rec.get('cpu_info')},
                {html: 'Memory'}, {style: "font-weight: bold", html: rec.get('memory') + 'MB'},
                {html: 'Swap'}, {style: "font-weight: bold", html: rec.get('swap_size') + 'MB'},
                {html: 'OS Release'}, {style: "font-weight: bold", html: rec.get('os_release')},
                {html: 'Kernel'}, {style: "font-weight: bold", html: rec.get('kernel')},
                {html: 'Template'}, {style: "font-weight: bold", html: rec.get('template')},
                {html: 'Uptime'}, {itemId: 'uptime', style: "font-weight: bold", html: rec.getUptime()},
                {html: 'ID'}, {style: "font-weight: bold", html: rec.getId()}]
        }, {
            title: "Metrics",
            layout: {type: 'table', columns: 2},
            frame: true,
            padding: '10 0 0 10',
            defaults: {
                width: 250,
                margin: '0 10 10 0'
            },
            items: this._createGaugeItems()
        }, {
            title: "Tags",
            itemId: 'label-tags',
            frame: true,
            items: [{
                itemId: 'tagger',
                xtype: 'tagger',
                suggestions: this.envTags,
                tags: this._getDisplayTags(),
                prefix: 'label:',
                listeners: {
                    'tagAdded': function(source, tag){
                        var rec = this.record;
                        Ext.Array.include(rec.get('tags'), tag);
                        rec.save();
                    }.bind(this),
                    'tagRemoved': function(source, tag){
                        var rec = this.record;
                        Ext.Array.remove(rec.get('tags'), tag);
                        rec.save();
                    }.bind(this)
                }
            }],
        }];

        this._uptimeUpdateInterval = setInterval(function() {
            this.down('#uptime').update(rec.get('state') === 'active' ?
                    rec.getUptime() : 'Server is switched off.');
        }.bind(this), 1000);

        this.callParent(arguments);
    },


    onRender: function() {
        this.callParent(arguments);
    },

    onDestroy: function() {
        this.callParent(arguments);

        clearInterval(this._uptimeUpdateInterval);
        delete this._uptimeUpdateInterval;
    },


    // Helper methods

    _getDisplayTags: function(){
        // display only custom tags from record (start with 'label:')
        var displayTags = [];
        Ext.Array.forEach(this.record.get('tags'), function(item){
            if(item.indexOf('label:') === 0) {
                displayTags.push(item);
            }
        }, this);

        return displayTags;
    },

    _createGaugeItems: function(){
        var gaugeItems = [];
        var diskLabels = {
            '/': 'Root',
            '/storage': 'Storage',
            '/vz': 'VZ'
        };

        // memory gauge
        gaugeItems.push({
            xtype: 'memorygauge',
            compute: this.record,
            label: 'Physical Memory',
            unit: 'MB',
            iconCls: 'icon-memory'
        });

        // disk gauges
        for (partition in this.record.get('diskspace')){
            if(partition.indexOf('/') !== 0)
                continue;
            gaugeItems.push({
                partition: partition,
                compute: this.record,
                xtype: 'diskgauge',
                label: (diskLabels[partition] ? diskLabels[partition] : partition) + ' Partition',
                unit: 'MB',
                metricsSubscriptionUrl: null,
                iconCls: 'icon-hd'
            });
        }

        return gaugeItems;
    },

});
