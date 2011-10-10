Ext.define('opennodeconsole.tabs.SystemTab', {
    extend: 'opennodeconsole.tabs.Tab',
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
            items: [{html: 'CPU info'}, {style: "font-weight: bold", html: rec.get('cpu')},
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
            items: [{label: 'CPU Usage', value: 0},
                    {label: 'HD Space (Root Partition)', value: 0, max: rec.get('diskspace_rootpartition'), unit: 'MB'},

                    {label: 'IO Delays', value: 0},
                    {label: 'HD Space (Storage Partition)', value: 0, max: rec.get('diskspace_storagepartition'), unit: 'GB'},

                    {label: 'Physical Memory', value: 0, max: rec.get('memory'), unit: 'MB'},
                    {label: 'HD Space (VZ Partition)', value: 0, max: rec.get('diskspace_vzpartition'), unit: 'GB'},

                    {label: 'Swap Space', value: 0, max: rec.get('swap_size'), unit: 'MB'},
                    {label: 'HD Space (Backup Partition)', value: 0, max: rec.get('diskspace_backuppartition'), unit: 'GB'},

                    {label: 'Network Usage', value: 0, max: rec.get('network_usage'), unit: 'Mbps'}]
        }];

        var me = this;
        this._uptimeUpdateInterval = setInterval(function() {
            me.down('#uptime').update('' + rec.getUptime());
        }, 1000);

        this.callParent(arguments);
    },

    onDestroy: function() {
        this.callParent(arguments);
        clearInterval(this._uptimeUpdateInterval);
        delete this._uptimeUpdateInterval;
    }
});
