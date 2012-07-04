Ext.define('Onc.controller.TasksController', {
    extend: 'Ext.app.Controller',

    views: ['TasksView', 'Viewport'],
    stores: ['TasksStore'],
    models: ['Base', 'Task', 'Command', 'ActionsContainer'],

    view: null,

    init: function() {
        this.registerBusListeners({
            displayTaskManager: function(){
                this.view = this.getView('TasksView').create();
                this.view.show();
                this._load();
            }.bind(this)
        }),

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
        this.view.setLoading(true);
        var tasksStore = this.getStore('TasksStore');
        tasksStore.load({
            scope: this,
            callback: function(records, operation, success) {
                this.view.setLoading(false);
            }
        });
    }
});
