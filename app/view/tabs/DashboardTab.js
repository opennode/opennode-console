Ext.define('Onc.view.tabs.DashboardTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computedashboardtab',

    autoScroll: true,
    bodyPadding: 0,
    _storeLoaded: false,
    

    listeners: {
        activate: function() {
            this._loadRunningServices();
            this._loadLastEvents();
        }
    },

    _loadLastEvents: function() {
        var eventContainer = this.down("#events-container");
        var eventCmp = this.down("#latest-events");
        eventContainer.setLoading(true);
        Onc.core.Backend.request('PUT', 'bin/catlog?arg=-n&arg=30')
            .success(function(response) {
            var stdout = response.stdout[0];
            if (stdout) {
                var logs = response.stdout[0].split('\n');
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
        })
            .failure(function(response) {
            console.assert(response.status === 403);
            eventCmp.update('<b>Event log loading failed with status ' + response.status + '</b>');
            eventContainer.setLoading(false);
        });
    },
    _loadRunningServices: function() {
        var resourceContainer = this.down('#resources-container');

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
            serviceCmp.update(msg);
            resourceContainer.setLoading(false);
        })
            .failure(function(response) {
            console.assert(response.status === 403);
            serviceCmp.update('<b>Detecting available resources failed: ' + response.status + '</b>');
            resourceContainer.setLoading(false);
        });
    },
    _loadPendingAction: function() {
        var pendingActionsContainer = this.down('#pending-actions-container');
        pendingActionsContainer.setLoading(true);
        
        var pendingActionsCmp = this.down("#pending-actions");
        Onc.core.Backend.request('GET', 'proc/?depth=1')
            .success(function(response){
                
                
                pendingActionsContainer.setLoading(false);
            })
            .failure(function(response){
                console.assert(response.status === 403);
                pendingActionsCmp.update('<b>Detecting available resources failed: ' + response.status + '</b>');
                pendingActionsContainer.setLoading(false);
            });
    },

    initComponent: function() {
        var me = this;
        this.items = [{
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            minHeight: 600,
            defaults: {
                minWidth: 150,
                minHeight: 200
            },
            items: [{
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'start'
                },
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
                },{
                    title: 'Pending actions',
                    itemId: 'pending-actions-container',
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
                                me._loadPendingAction();
                            }
                        }]
                    },{
                        xtype: 'displayfield',
                        itemId: 'pending-actions',
                    }]
                }]
            }, {
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'start'
                },
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
                        itemId: 'latest-events',
                    }]
                }]
            }]
        }];
        this.callParent(arguments);
    }
});
