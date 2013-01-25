Ext.define('Onc.view.tabs.DashboardTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computedashboardtab',

    autoScroll: true,
    bodyPadding: 0,
    _storeLoaded: false,

    listeners: {
        activate: function () {
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

    initComponent: function () {
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
                },
                items: [{
                    title: 'Runnig services',
                    defaults: {
                        xtype: 'box',
                        padding: 5
                    },
                    items: [{
                        html: '# physical servers'
                    }, {
                        html: '# cloud servers'
                    }, {
                        html: '# HA cloud servers'
                    }, {
                        html: '# subnets'
                    }, {
                        html: '# Virtual machines'
                    }, {
                        html: '# of assigned RAM'
                    }, {
                        html: '# of assigned disk space'
                    }]
                }, {
                    title: 'Pending actions',
                    defaults: {
                        xtype: 'box',
                        padding: 5
                    },
                    items: [{
                        html: '<p>PLACEHOLDER</p>'
                    }]
                }, {
                    title: 'Running tasks',
                    defaults: {
                        xtype: 'box',
                        padding: 5
                    },
                    items: [{
                        html: '<p>PLACEHOLDER</p>'
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
                            '->',
                            {
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