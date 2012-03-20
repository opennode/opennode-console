Ext.define('Onc.tabs.SystemTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computesystemtab',

    defaults: {
        margin: '0 0 10px 0',
    },
    autoScroll: true,

    tags: {
        'env:production' : 'Production',
        'env:staging' : 'Staging',
        'env:development' : 'Development',
        'env:infrastructure' : 'Infrastructure',
        'env:support' : 'Support'
    },

    initComponent: function() {
        var rec = this.record;
        var tagsRec = rec.get('tags');

        var tagItems = [];
        for (tag in this.tags) {
            tagItems[tagItems.length] = {
                itemId: tag,
                boxLabel: this.tags[tag],
                checked: Ext.Array.contains(tagsRec, tag),
            }
        }
        tagItems[tagItems.length] = {
            xtype: 'button',
            text: 'Save',
            handler: this.saveTags,
            scope: this
        };

        this.items = [{
            layout: {type: 'table', columns: 2},
            frame: true,
            defaults: {
                xtype: 'box',
                padding: 5
            },
            items: [{html: 'CPU info'}, {style: "font-weight: bold", html: rec.get('cpu_info')},
                    {html: 'Memory'}, {style: "font-weight: bold", html: rec.get('memory') + 'MB'},
                    {html: 'Swap'}, {style: "font-weight: bold", html: rec.get('swap_size') + 'MB'},
                    {html: 'OS Release'}, {style: "font-weight: bold", html: rec.get('os_release')},
                    {html: 'Kernel'}, {style: "font-weight: bold", html: rec.get('kernel')},
                    {html: 'Template'}, {style: "font-weight: bold", html: rec.get('template')},
                    {html: 'Uptime'}, {itemId: 'uptime', style: "font-weight: bold", html: rec.getUptime()}]
        }, {
            layout: {type: 'table', columns: 2},
            frame: true,
            defaults: {
                xtype: 'gauge',
                width: 250,
                margin: 10
            },
            items: [

                {itemId: 'diskspace-root-gauge', label: 'Root Partition', value: rec.get('diskspace_usage')['/'],
                                                            max: rec.get('diskspace')['/'], unit: 'MB'},
                {itemId: 'diskspace-storage-gauge', label: 'Storage Partition', value: rec.get('diskspace_usage')['/storage'],
                                                            max: rec.get('diskspace')['/storage'], unit: 'MB'},

                {itemId: 'ram-gauge', label: 'Physical Memory', value: 0, max: rec.get('memory'), unit: 'MB'},
                {itemId: 'diskspace-vz-gauge', label: 'VZ Partition', value: rec.get('diskspace_usage')['/vz'],
                                                            max: rec.get('diskspace')['/vz'], unit: 'MB'},
            ]
        }, {
            itemId: 'label-tags',
            layout: {type: 'table'},
            frame: true,
            defaults: {
                xtype: 'checkboxfield',
                margin: 10
            },
            items: tagItems
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
        console.assert(!this._hubListener);
        this._hubListener = this._onDataFromHub.bind(this);

        var baseUrl= this.record.get('url');
        Onc.hub.Hub.subscribe(this._hubListener, {
            'memory': baseUrl + 'metrics/{0}_usage'.format('memory'),
            'diskspace': baseUrl + 'metrics/{0}_usage'.format('diskspace'),
        }, 'gauge');
    },

    _streamUnsubscribe: function() {
        Onc.hub.Hub.unsubscribe(this._hubListener);
    },

    _onDataFromHub: function(values) {
        this.down('#ram-gauge').setValue(values['memory']);
    },

    onDestroy: function() {
        this.callParent(arguments);

        clearInterval(this._uptimeUpdateInterval);
        delete this._uptimeUpdateInterval;

        this._streamUnsubscribe();
    },

    saveTags: function() {
        var rec = this.record;
        var tagsRec = rec.get('tags');
        var labelTags = this.getComponent('label-tags');

        for (tag in this.tags) {
            if (labelTags.getComponent(tag).getValue()) {
                Ext.Array.include(tagsRec, tag);
            } else {
                Ext.Array.remove(tagsRec, tag);
            }
        }

        rec.set('tags', tagsRec);
        rec.save();
    }
});
