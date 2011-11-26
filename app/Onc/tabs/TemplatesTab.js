Ext.define('Onc.tabs.TemplatesTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computetemplatestab',

    layout: 'fit',

    initComponent: function() {
        this.items = {
            xtype: 'gridpanel',
            title: 'Templates',
            store: this.record.getList('templates'),
            forceFit: true,
            multiSelect: true,
            tbar: [{icon: 'img/icon/add.png'},
                   {icon: 'img/icon/delete.png'}],
            plugins: Ext.create('Ext.grid.plugin.RowEditing'),

            columns: [
                {header: 'ID', dataIndex: 'id', width: 40},
                {header: 'Name', dataIndex: 'name'},
                {header: 'Base OS', dataIndex: 'base_os'},
                {header: 'Min. Disk', dataIndex: 'min_disk'},
                {header: 'Min. Memory', dataIndex: 'min_memory'},
                {header: 'Min. CPU', dataIndex: 'min_cpu'},
                {header: 'Storage Name', dataIndex: 'storage_name'}
            ]
        };
        this.callParent(arguments);
    }
});
