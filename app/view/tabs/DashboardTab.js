Ext.define('Onc.view.tabs.DashboardTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computedashboardtab',
    require: 'Onc.core.util.Completer',

    autoScroll: true,
    bodyPadding: 0,
    layout: 'fit',
    border: true,
    style: {
        borderColor: 'inherit',
        borderStyle:'solid',
        borderWidth:'1px'
    },
    _storeLoaded: false,

    listeners: {
        activate: function() {
            this._loadRunningServices();
            this._loadRunningTasks();
            this._loadLastEvents();
        }
    },

    _loadLastEvents: function() {
        var me = this;
        var eventContainer = this.down("#events-container");
        var eventCmp = this.down("#latest-events");
        eventContainer.setLoading(true);
        Onc.core.Backend.request('PUT', 'bin/catlog?arg=-n&arg=30&asynchronous=1')
            .success(function(response) {
                var c = new Onc.core.util.Completer();
                c.callAndCheck(response.pid,
                    function(response) {
                        //TODO remove this if when stdout will be implemented
                        if (response.responseText != undefined) {
                            var stdout = JSON.parse(response.responseText).stdout[0];
                            if (stdout) {
                                var logs = stdout.split('\n');
                                var msg = '<ol>';
                                for (var i = 0; i < logs.length; i++) {
                                    // get the log components
                                    msg += '<li>' + logs[i] + '</li>';
                                }
                                msg += '</ol>';
                                eventCmp.update(msg);
                            } else {
                                eventCmp.update('<b>No event logs available (OMS is probably logging to stdout).</b>');
                            }
                            eventContainer.setLoading(false);
                        } else {
                            eventCmp.update('<b>/proc/completed/ does not return stdout</b>');
                            eventContainer.setLoading(false);
                        }

                    },
                    function(response) {
                        eventCmp.update('<b>Event log loading failed with status ' + response.status + '</b>');
                        eventContainer.setLoading(false);
                    })
        })
            .failure(function(response) {
                console.assert(response.status === 403);
                eventCmp.update('<b>Event log loading failed with status ' + response.status + '</b>');
                eventContainer.setLoading(false);
        });
    },
    _loadRunningServices: function() {
        var resourceContainer = this.down('#resources-container');
        var me = this;
        var serviceCmp = this.down("#running-services");
        resourceContainer.setLoading(true);

        Onc.core.Backend.request('GET', 'machines/?depth=3&attrs=diskspace,memory,__type__')
            .success(function(response) {

            var physServers = 0;
            var physCloudServers = 0;
            var physHACloudServers = 0;
            var subnets = 0;
            var virtMachines = 0;
            var assignedRam = 0;
            var assignedHDD = 0;


            for (var i = 0; i < response.children.length; i++) {
                var serv = response.children[i];
                if (serv.__type__ == 'Compute') {
                    physServers++;
                    physCloudServers++;
                    assignedHDD += serv.diskspace.total;
                    assignedRam += parseInt(serv.memory, 10);
                    for (var j = 0; j < serv.children.length; j++) {
                        var child = serv.children[j];
                        if (child.__type__ == 'VirtualizationContainer') {
                            virtMachines += child.children.length;
                        }
                    }
                }
            }

            var msg = '<ol>';
            msg += '<li><strong>' + physServers + '</strong> physical servers</li>';
            msg += '<ul>';
            msg += '<li><strong>' + physCloudServers + '</strong> cloud servers</li>';
            msg += '<li><strong>' + physHACloudServers + '</strong> HA cloud servers</li>';
            msg += '</ul>';
            msg += '<li><strong>' + virtMachines + '</strong> Virtual machines</li>';
            msg += '<li><strong>' + assignedRam + '</strong> of assigned RAM</li>';
            msg += '<li><strong>' + Math.round(assignedHDD) + '</strong> of assigned disk space</li>';

            msg += '</ol>';
            serviceCmp.update(me._wrapHtml(msg));
            resourceContainer.setLoading(false);
        })
            .failure(function(response) {
            console.assert(response.status === 403);
            serviceCmp.update('<b>Detecting available resources failed: ' + response.status + '</b>');
            resourceContainer.setLoading(false);
        });
    },

    _loadRunningTasks: function() {
        var runningTasksContainer = this.down('#running-tasks-container');
        runningTasksContainer.setLoading(true);
        var runningTasksCmp = this.down("#running-tasks");
        Onc.core.Backend.request('GET', 'proc/?depth=1&attrs=__type__,cmdline')
            .success(function(response){
                var msg = '<ul class="ulist">';
                var tasks = response.children;
                for(var i = 0; i < tasks.length; i++){
                    var task = tasks[i];
                    if(task.__type__ == 'Task'){
                        msg += '<li>';
                        msg += task.id + ': ' + task.cmdline;
                        msg += '</li>';
                    }
                }
                msg += '</ul>';

                runningTasksCmp.update(msg);
                runningTasksContainer.setLoading(false);
            })
            .failure(function(response){
                console.assert(response.status === 403);
                runningTasksCmp.update('<b>Detecting running tasks has failed: ' + response.status + '</b>');
                runningTasksContainer.setLoading(false);
            });
    },

    initComponent: function() {
        var me = this;
        this.items = [{
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },

//            minHeight: 200,
            defaults: {
                minWidth: 150
//                minHeight: 200
            },
            items: [{
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
//                    pack: 'start'
                },
                autoScroll: true,

                width: '50%',
                defaults: {
                    xtype: 'fieldset',
                    margin: '5 5 5 10',
                    componentCls: 'resources'
                },
                items: [{
                    title: 'Available resources',
                    itemId: 'resources-container',
                    defaults: {
                        xtype: 'container',
                        padding: 5
                    },
                    items: [{
                        xtype: 'toolbar',
                        items: [
                            '->', {
                            text: 'Refresh',
                            handler: function() {
                                me._loadRunningServices();
                            }
                        }]
                    }, {
                        xtype: 'displayfield',
                        itemId: 'running-services'
                    }]
                }, {
                    title: 'Running tasks',
                    itemId: 'running-tasks-container',
                    defaults: {
                        xtype: 'container',
                        padding: 5
                    },
                    items: [{
                        xtype: 'toolbar',
                        items: [
                            '->', {
                            text: 'Refresh',
                            handler: function() {
                                me._loadRunningTasks();
                            }
                        }]
                    },{
                        xtype: 'displayfield',
                        itemId: 'running-tasks'
                    }]
                }]
            }, {
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                autoScroll: true,
//                layout : 'fit',
                width: '50%',
                defaults: {
                    xtype: 'fieldset',
                    margin: '5 5 5 10'
                },
                items: [{
                    title: 'Latest events',
                    itemId: 'events-container',
                    defaults: {
                        xtype: 'container',
                        padding: 5
                    },
                    items: [{
                        xtype: 'toolbar',
                        items: [
                            '->', {
                            text: 'Refresh',
                            handler: function() {
                                me._loadLastEvents();
                            }
                        }]
                    }, {
                        xtype: 'displayfield',
                        itemId: 'latest-events'
                    }]
                }]
            }]
        }];
        this.callParent(arguments);
    },
    _wrapHtml: function(html){
        var wrapStart = '<div class="scrollPort">';
        var wrapEnd = '</div>';
        return wrapStart + html + wrapEnd;
    }

});
