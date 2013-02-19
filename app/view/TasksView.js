Ext.define('Onc.view.TasksView', {
    extend: 'Ext.window.Window',
    alias: 'widget.tasksView',

    title: 'Task Manager',
    modal: true,
    border: false,
    layout: 'fit',
    width: 500,
    height: 500,

    defaults: {
        border: false,
        bodyStyle: 'background: inherit'
    },

    items: [{
       xtype: 'grid',
       columns: [
           {header: 'Id', dataIndex: 'id', width: 50},
           {header: 'Command', dataIndex: 'cmdline', flex: 1},
           {header: 'Actions', dataIndex: 'url', width: 100}
       ],
       store: 'TasksStore'
    }],

    buttons: [{
        text: 'Reload'
    }, {
        text: 'Close' ,
        handler: function() {
            this.up('window').destroy();
        }
    }],


    initComponent: function() {
        // register events for controller
        this.addEvents('taskActionPerformed', 'reload');

        // add renderer for Actions column on grid item
        var gridItem = this.items[0];
        var actionColumn = gridItem.columns[2];
        actionColumn.renderer =  makeColumnRenderer(function(domId, value, metadata, record){
            var actions = record.getActions();
            if (actions){
                var actionCount = actions.getCount();
                for(var i = 0; i < actionCount; i++){
                    var action = actions.getAt(i);
                    // XXX for now we conceal terminate from the view
                    if (action.internalId === 'terminate')
                        continue;
                    this._createCommand(domId, record, action);
                }
            }
        }.bind(this));

        // add handler for reload button
        var reloadButton = this.buttons[0];
        reloadButton.handler = function(){
            this.fireEvent('reload');
        }.bind(this);

        this.callParent(arguments);
    },

    // create button for task's action
    _createCommand: function(domId, record, action){
        return Ext.create('Ext.Button', {
            text: action.get('id'),
            margin: '0 3 0 0',
            padding: 0,
            renderTo: domId,
            handler: function() {
                this.fireEvent('taskActionPerformed', record, action);
            }.bind(this)
        });
    }
});
