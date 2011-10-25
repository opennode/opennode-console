Ext.define('opennodeconsole.tabs.TemplatesTab', {
    extend: 'opennodeconsole.tabs.Tab',
    alias: 'widget.computetemplatestab',

    layout: 'fit',

    initComponent: function() {
        this.items = {
            xtype: 'gridpanel',
            title: 'Templates',
            // store: this.record.templates(),
            store: Ext.create('Ext.data.Store', {
                model: 'opennodeconsole.model.Template',
                idProperty: 'id',
                data: [
                    {'id': 'af109692-1824-ff90-123a-998b', 'name': 'storage1', 'base_os': 'dos', 'min_disk': '10', 'min_memory': '512', 'min_cpu': '1000', 'storage_name': 'supperfloppy1'},
                    {'id': 'fa011231-1aab-f9f0-12a3-18b9', 'name': 'storage2', 'base_os': 'dos', 'min_disk': '10', 'min_memory': '256', 'min_cpu': '1200', 'storage_name': 'supperfloppy1'},
                    {'id': 'af106432-09ee-cf90-b123-598b', 'name': 'storage3', 'base_os': 'dos', 'min_disk': '20', 'min_memory': '256', 'min_cpu': '1200', 'storage_name': 'supperfloppy1'},
                    {'id': 'fa109304-a9bd-cd01-123a-198b', 'name': 'storage4', 'base_os': 'win31', 'min_disk': '30', 'min_memory': '512', 'min_cpu': '800', 'storage_name': 'supperfloppy1'},
                    {'id': 'a1f00192-6912-aa09-453a-938b', 'name': 'storage5', 'base_os': 'linux', 'min_disk': '5', 'min_memory': '512', 'min_cpu': '800', 'storage_name': 'supperfloppy1'}
                ]
            }),
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
