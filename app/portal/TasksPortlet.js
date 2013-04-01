Ext.define('Onc.portal.TasksPortlet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.tasksportlet',
    minHeight: 200,
    border: false,

    initComponent: function() {

        Ext.apply(this, {
            store: 'TasksStore',
            hideHeaders: true,
            bodyCls:'tasks-table',
            style:{
                background:"transparent",
            },
            columns: [{
                id: 'id',
                text: 'Id',
                width: 75,
                sortable: true,
                dataIndex: 'id',
                hidden: true
            }, {
                text: 'Cmdline',
                flex: 1,
                sortable: true,
                dataIndex: 'cmdline',
                renderer: function(value, metaData, record, row, col, store, gridView) {
                    var color="#5bcb63";
                    metaData.style = 'border-bottom:1px solid {0};border-left:8px solid {0}'.format(color);
                    return value;
                }
            }]
        });

        this.callParent(arguments);
    }
});
