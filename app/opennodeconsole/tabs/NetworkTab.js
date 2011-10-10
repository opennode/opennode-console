Ext.define('opennodeconsole.tabs.NetworkTab', {
    extend: 'opennodeconsole.tabs.Tab',
    alias: 'widget.computenetworktab',

    layout: 'fit',

    initComponent: function() {
        var me = this;
        var rec = this.record;

        var _membersRenderer = function(members) {
            var id = Ext.id();

            setTimeout(function() {
                var memberListView = Ext.create('widget.dataview', {
                    cls: 'bridge-interface-members',
                    tpl: [
                        '<tpl for=".">',
                        '  <div>{name}</div>',
                        '</tpl>'
                    ],
                    itemSelector: 'td',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['name'],
                        data: members.map(function(memberName) { return {name: memberName}; }),
                    }),
                    renderTo: id
                });
            }, 100);

            return Ext.String.format('<div id="{0}"></div>', id);
        };

        this.items = [{
            xtype: 'gridpanel',
            title: 'Bridge Interfaces',
            forceFit: true,
            store: rec.bridgeInterfaces(),

            columns: [
                {header: 'Name', dataIndex: 'id', width: 40},
                {header: 'Inet4', dataIndex: 'ipv4_address', width: 75},
                {header: 'Inet6', dataIndex: 'ipv6_address', width: 150},
                {header: 'Members', dataIndex: 'members', width: 150, renderer: _membersRenderer},
                {header: 'Subnet Mask', dataIndex: 'subnet_mask', width: 75},
                {header: 'Broadcast', dataIndex: 'bcast', width: 75},
                {header: 'Hardware Address', dataIndex: 'hw_address'},
                {header: 'Metric', dataIndex: 'metric', width: 25},
                {header: 'STP', dataIndex: 'stp', width: 40},
                {header: 'RX', dataIndex: 'rx', width: 50},
                {header: 'TX', dataIndex: 'tx', width: 50},
            ]
        }];

        this.callParent(arguments);
    }
});
