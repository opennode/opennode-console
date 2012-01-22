Ext.define('Onc.tabs.VmMapTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computevmmaptab',

    layout: 'fit',

    initComponent: function() {
        this.items = [{
            xtype: 'gridpanel',
            hideHeaders: true,
            store: 'PhysicalComputesStore',
            //plugins: Ext.create(''),
            columns: [
                {header: 'Name', dataIndex: 'hostname', width: 100},
                {header: 'Map', flex: 1},

                {header: 'ID', dataIndex: 'id', width: 130, hidden: true}
            ]
        }];
        
        this.callParent(arguments);
    }
});
