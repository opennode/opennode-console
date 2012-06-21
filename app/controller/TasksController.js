Ext.define('Onc.controller.TasksController', {
    extend: 'Ext.app.Controller',

    views: ['TasksView', 'Viewport'],
    stores: ['TasksStore'],
    models: ['Base', 'Task', 'Command', 'ActionsContainer'],

    refs: [{ref: 'tasks', selector: '#tasks'}],

    _viewport: null,

    init: function() {
        this.control({
            '#tasks-button': {
                click: function() {
                    var tasksStore = this.getStore('TasksStore');

                    taskView = this.getView('TasksView').create({
                        tasksStore: tasksStore
                    });
                    taskView.show();
                    taskView.setLoading(true);

                    tasksStore.load({
                        scope   : this,
                        callback: function(records, operation, success) {
                            console.log(records);
                            taskView.setLoading(false);
                        }
                    });
                }
            }
        });
    },
});
