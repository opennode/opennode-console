Ext.define('Onc.controller.TasksController', {
    extend: 'Ext.app.Controller',

    views: ['TasksView', 'Viewport'],
    stores: ['TasksStore'],
    models: ['Base', 'Task', 'Command', 'ActionsContainer'],

    view: null,

    busListeners: {
        displayTaskManager: function(ev) {
            this.view = this.getView('TasksView').create();
            this.view.show();
            this._load();
        }
    },

    init: function() {
        this.control({
            'tasksView': {
                'taskActionPerformed': function(record, action){
                    var url = record.get('url') + 'actions/' + action.get('id');
                    Onc.Backend.request('PUT', url, {
                        success: function(response) {
                            this._load();
                        }.bind(this),
                        failure: function(response) {
                            console.error('action ' + url + ' failed: ' + response.responseText);
                        }
                    });
                },
                'reload': function(){
                    this._load();
                }
            }
        });
    },

    _load: function(){
        this.getStore('TasksStore').load();
    }
});
