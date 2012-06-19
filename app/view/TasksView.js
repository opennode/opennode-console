Ext.define('Onc.view.TasksView', {
    extend: 'Ext.window.Window',
    alias: 'widget.tasks',

    title: 'Task Manager',
    modal: true,
    border: false,
    width: 500,

    defaults: {
        border: false,
        bodyStyle: 'background: inherit',
        bodyPadding: 4
    },

    config: {
        tasksStore: null
    },

    tasksStore: null,

    items: {
       xtype: 'grid',
       itemId: 'tasksList',
       height: 300,
       columns: [
           {header: 'Id', dataIndex: 'id'},
           {header: 'Type', dataIndex: '__type__'},
           {header: 'Url', dataIndex: 'url'},
           {header: 'Actions', dataIndex: 'url',
               renderer: function(value, metadata, record){
                   return record.actions().count();
               }
           }
       ],
       store: 'TasksStore'
    },

    buttons: [{
        text: 'Close' , handler: function() {
            this.up('window').destroy();
        }
    }, {
        text: 'Create', itemId: 'create-new-vm-button'
    }],
});
