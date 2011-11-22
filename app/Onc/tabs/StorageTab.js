Ext.define('Onc.tabs.StorageTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computestoragetab',

    layout: 'fit',

    initComponent: function() {
        this.items = {
            xtype: 'gridpanel',
            title: 'Storage',
            // store: this.record.storages(),
            store: Ext.create('Ext.data.Store', {
                model: 'Onc.model.Storage',
                idProperty: 'id',
                data: [
                    {'id': '1', 'name': 'storage1', path: '/foo/bar/baz', type: 'floppy', usage: 'bad'},
                    {'id': '2', 'name': 'storage2', path: '/foo/bar/baz', type: 'floppy', usage: 'bad'},
                    {'id': '3', 'name': 'storage3', path: '/foo/bar/baz', type: 'floppy', usage: 'bad'},
                    {'id': '4', 'name': 'storage4', path: '/foo/bar/baz', type: 'floppy', usage: 'bad'},
                    {'id': '5', 'name': 'storage5', path: '/foo/bar/baz', type: 'floppy', usage: 'hopefully never'}
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
                {header: 'Path', dataIndex: 'path'},
                {header: 'Type', dataIndex: 'type'},
                {header: 'Usage', dataIndex: 'usage'}
            ]
        };
        this.callParent(arguments);
    }
});
