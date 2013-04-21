Ext.define('Onc.store.TasksPortletStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Task',
    autoLoad: true,

    // array of services to hide, show error if all service variants are missing
    hideTasksShowIfMissing: [["/bin/init"], ["[db_pack]", "[db_pack: paused]"], ["[indexer]", "[indexer: paused]"], ["[ping-check]", "[ping-check: paused]"], ["[metrics]", "[metrics: paused]"], ["[sync]", "[sync: paused]"]],
    notifyIfPausedThere: ["[db_pack: paused]", "[indexer: paused]", "[ping-check: paused]", "[metrics: paused]", "[sync: paused]"],

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },
        extraParams: {
            depth: 1,
            exclude: 'completed'
        },
        url: 'proc'
    },

    sorters: [{
        property: 'id',
        direction: 'ASC'
    }],

    startAutoRefresh: function(interval) {
        if (this.autoRefreshProcId) {
            clearInterval(this.autoRefreshProcId);
        }
        this.autoRefreshProcId = setInterval(function() {
            this.reload()
        }.bind(this), interval * 1000);
    },
    listeners: {
        load: function(store, records, successful, eOpts) {
            this._staticLoad(store, records, successful, eOpts)
        }
    },

    _staticLoad: function() {
        var store = this;

        // Lets clear filter, give record statuses and apply filter
        store.clearFilter();
        var isAdmin = Onc.model.AuthenticatedUser.isAdmin();
        if (isAdmin) {
            Ext.each(store.hideTasksShowIfMissing, function(taskArr) {
                var dItem = -1;
                for ( var i = 0; i < taskArr.length; i++) {
                    dItem = store.findExact("cmdline", taskArr[i]);
                    if (dItem !== -1) break;
                }
                ;

                if (dItem === -1) {
                    var task = Ext.create('Onc.model.Task', {
                        cmdline: taskArr[0],
                        __type__: "Task",
                        status: "ERROR"
                    });
                    store.add(task);
                } else {
                    var task = store.getAt(dItem);
                    task.set('status', "HIDE");// Causes TaskView grid to flicker
                }
            });
            Ext.each(store.notifyIfPausedThere, function(taskCmd) {
                var dItem = store.findExact("cmdline", taskCmd);

                if (dItem !== -1) {
                    var task = store.getAt(dItem);
                    task.set('status', "NOTIFY_PAUSED");
                }
            });
        }
        store.filter([{
            property: '__type__',
            value: /Task/
        }, {
            property: 'status',
            value: /^((?!HIDE).)*$/
        }]);
    }

});
