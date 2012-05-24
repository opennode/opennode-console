Ext.define('Onc.tabs.SystemTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computesystemtab',

    defaults: {
        xtype: 'fieldset',
        margin: '0 0 10px 0'
    },
    autoScroll: true,

    envTags: ['label:Infrastructure', 'label:Staging', 'label:Development', 'label:Production'],

    gauges: {
        'memory': {id: 'ram', label: 'Physical Memory', iconCls: 'icon-memory'},
        '/': {id: 'diskspace-root', label: 'Root', disk: true},
        '/storage': {id: 'diskspace-storage', label: 'Storage', disk: true},
        '/vz': {id: 'diskspace-vz', label: 'VZ', disk: true},
    },

    initComponent: function() {
        var me = this;
        var rec = this.record;
        var tagsRec = rec.get('tags');

        this.addEvents('vmsstart', 'vmsstop', 'vmssuspend', 'vmsgraceful', 'vmedit');

        // display only custom tags from record (start with 'label:')
        var displayTags = [];
        Ext.Array.forEach(tagsRec, function(item){
            if(item.indexOf('label:') === 0) {
                displayTags.push(item);
            }
        }, this);

        function _changeStateWithConfirmation(confirmTitle, confirmText, eventName, target, cb) {
            Ext.Msg.confirm(confirmTitle, confirmText,
                function(choice) {
                    if (choice === 'yes') {
                        me.setLoading(true, true);
                        me.fireEvent(eventName, target, function() {
                                    cb();
                                    me.setLoading(false);
                                    });
                    }
                });
        }

        var diskspaceUsage = rec.get('diskspace_usage');
        var diskspace = rec.get('diskspace');
        var gaugeItems = [];

        // non-disk gauges
        for (resource in this.gauges) {
            gauge = this.gauges[resource];
            if(gauge.disk)
                continue;
            gaugeItems[gaugeItems.length] = {
                itemId: gauge.id + '-gauge',
                label: gauge.label,
                unit: 'MB',
                value: rec.get(resource + '_usage'),
                max: rec.get(resource),
                iconCls: gauge.iconCls
            };
        }

        // disk gauges
        for (partition in diskspace){
            gauge = this.gauges[partition];
            // display only partitions (without total, etc.)
            if(partition.indexOf('/') !== 0)
                continue;
            gaugeItems[gaugeItems.length] = {
                itemId: (gauge !== undefined ? gauge.id : partition.replace('/', '_')) + '-gauge',
                label: (gauge !== undefined ? gauge.label : partition) + ' Partition',
                unit: 'MB',
                max: diskspace[partition],
                value: diskspaceUsage[partition],
                iconCls: 'icon-hd'
            };
        }

        this.items = [{
            title: 'System Control',
            layout: 'hbox',
            items: [Ext.widget('computestatecontrol', {
                enableText: true,
                disableDetails: true,
                disableDelete: true,
                disableEdit: rec.isPhysical(),
                initialState: (rec.get('state') === 'active' ?
                               'running' :
                               rec.get('state') === 'suspended' ?
                               'suspended' :
                               'stopped'),
                listeners: {
                    'start': function(_, cb) { _changeStateWithConfirmation('Starting a VM',
                               'Are you sure you want to boot this VM?',
                               'vmsstart',
                               [rec],
                               cb);
                    },
                    'suspend': function(_, cb) { me.fireEvent('vmssuspend', [rec], cb); },
                    'graceful': function(_, cb) {
                        _changeStateWithConfirmation('Shutting down a VM',
                               'Are you sure? All of the processes inside a VM will be stoppped',
                               'vmsgraceful',
                               [rec],
                               cb);
                    },
                    'stop': function(_, cb) { me.fireEvent('vmsstop', [rec], cb); },
                    'edit' : function(_, cb) { me.fireEvent('vmedit', rec, cb); },
                }}), {
                xtype: 'container',
                cls: 'computestatecontrol',
                items: {
                    xtype: 'button',
                    itemId: 'zabbix-button',
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
            defaults: {
                xtype: 'gauge',
                width: 250,
                margin: 10
            },
            items: gaugeItems
        }, {
            title: "Tags",
            itemId: 'label-tags',
            frame: true,
            items: [{
                itemId: 'tagger',
                xtype: 'tagger',
                suggestions: this.envTags,
                tags: displayTags,
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

        var me = this;
        this._uptimeUpdateInterval = setInterval(function() {
            me.down('#uptime').update(rec.get('state') === 'active' ?
                                      rec.getUptime() : 'Server is switched off.');
        }, 1000);

        this.callParent(arguments);
    },

    onRender: function() {
        this.callParent(arguments);
        this._streamSubscribe();
    },

    _streamSubscribe: function() {
        var baseUrl= this.record.get('url');
        this.subscription = Onc.hub.Hub.subscribe(this._onDataFromHub.bind(this), {
            'memory': baseUrl + 'metrics/{0}_usage'.format('memory'),
            'diskspace': baseUrl + 'metrics/{0}_usage'.format('diskspace'),
        }, 'gauge');
    },

    _onDataFromHub: function(values) {
        this.down('#ram-gauge').setValue(values['memory']);
    },

    onDestroy: function() {
        this.callParent(arguments);

        clearInterval(this._uptimeUpdateInterval);
        delete this._uptimeUpdateInterval;

        console.assert(this.subscription);
        this.subscription.unsubscribe();
    },
});
