Ext.define('Onc.tabs.SystemTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computesystemtab',

    initComponent: function() {
        var rec = this.record;

        this.items = [{
            layout: {type: 'table', columns: 2},
            frame: true,
            margin: '0 0 10px 0',
            defaults: {
                xtype: 'box',
                padding: 5
            },
            items: [{html: 'CPU info'}, {style: "font-weight: bold", html: rec.get('cpu_info')},
                    {html: 'Memory'}, {style: "font-weight: bold", html: rec.get('memory') + 'MB'},
                    {html: 'OS Release'}, {style: "font-weight: bold", html: rec.get('os_release')},
                    {html: 'Kernel'}, {style: "font-weight: bold", html: rec.get('kernel')},
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
                {label: 'HD Space (Root Partition)', value: 0, max: rec.get('diskspace_rootpartition'), unit: 'MB'},

                {label: 'HD Space (Storage Partition)', value: 0, max: rec.get('diskspace_storagepartition'), unit: 'GB'},

                {label: 'Physical Memory', value: 0, max: rec.get('memory'), unit: 'MB'},
                {label: 'HD Space (VZ Partition)', value: 0, max: rec.get('diskspace_vzpartition'), unit: 'GB'},

                {label: 'Swap Space', value: 0, max: rec.get('swap_size'), unit: 'MB'},
                {label: 'HD Space (Backup Partition)', value: 0, max: rec.get('diskspace_backuppartition'), unit: 'GB'}
            ]
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
    }
});
