Ext.define('opennodeconsole.tabs.NetworkTab', {
    extend: 'opennodeconsole.tabs.Tab',
    alias: 'widget.computenetworktab',

    layout: 'fit',

    initComponent: function() {
        var me = this;
        var rec = this.record;

        this.items = [{
            xtype: 'gridpanel',
            title: 'Bridge Interfaces',

            store: rec.bridgeInterfaces(),

            columns: [
                {header: 'Name', dataIndex: 'id', width: 45},
                {header: 'Inet4', dataIndex: 'ipv4_address'},
                {header: 'Inet6', dataIndex: 'ipv4_address'},
                {header: 'Subnet Mask', dataIndex: 'subnet_mask'},
                {header: 'Broadcast', dataIndex: 'bcast'},
                {header: 'Hardware Address', dataIndex: 'hw_address'},
                {header: 'Metric', dataIndex: 'metric'},
                {header: 'STP', dataIndex: 'stp'},
                {header: 'RX', dataIndex: 'rx'},
                {header: 'TX', dataIndex: 'tx'},
            ]
        }];

        this.callParent(arguments);
    }
});
