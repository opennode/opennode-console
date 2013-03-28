Ext.define('Onc.portal.LogPortlet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.logportlet',
    uses: ['Ext.data.ArrayStore'],
    height: 300,

    store: Ext.create('Ext.data.ArrayStore', {
        fields: [{
            name: 'time'
        }, {
            name: 'level'
        }, {
            name: 'message'
        }]
    }),

    _loadLastEvents: function() {
        var me = this;
        var eventContainer = this.up("#logPortlet");
        eventContainer.setLoading(true);
        Onc.core.Backend.request('PUT', 'bin/catlog?arg=-n&arg=30&asynchronous=1').success(function(response) {
            var c = new Onc.core.util.Completer();
            c.callAndCheck(response.pid, function(response) {
                if (response.responseText != undefined) {
                    var stdout = JSON.parse(response.responseText).stdout[0];
                    if (stdout) {
                        var logs = stdout.split('\n');
                        for ( var i = 0; i < logs.length; i++) {
                            // get the log components
                            var message = logs[i];
                            var secondSpace = /^([\S]+\s){2}/gi;
                            
                            //TODO: Clean splitting up log row
                            var date = message.substr(0, message.indexOf(" "));
                            message = message.substr(message.indexOf(" ") + 1);
                            var time = message.substr(0, message.indexOf(" "));
                            message = message.substr(message.indexOf(" ") + 1);
                            var p = message.substr(0, message.indexOf(" "));
                            message = message.substr(message.indexOf(" ") + 1);
                            var user = message.substr(0, message.indexOf(" "));
                            message = message.substr(message.indexOf(" ") + 1);
                            var level = message.substr(0, message.indexOf(" "));
                            message = message.substr(message.indexOf(" ") + 1);
                            if (time) {
                                var d = {
                                    'time': date + " " + time,
                                    'message': message,
                                    'level': level
                                };

                                this.store.add(d);
                            }// not correct line
                        }
                    } else {
                        // eventCmp.update('<b>No event logs available (OMS is probably logging to stdout).</b>');
                    }
                    eventContainer.setLoading(false);
                } else {
                    // eventCmp.update('<b>/proc/completed/ does not return stdout</b>');
                    eventContainer.setLoading(false);
                }

            }.bind(this), function(response) {
                // eventCmp.update('<b>Event log loading failed with status ' + response.status + '</b>');
                eventContainer.setLoading(false);
            })
        }.bind(this)).failure(function(response) {
            console.assert(response.status === 403);
            // eventCmp.update('<b>Event log loading failed with status ' + response.status + '</b>');
            eventContainer.setLoading(false);
        });
    },
    initComponent: function() {

        Ext.apply(this, {
            // height: 300,
            height: this.height,
            store: this.store,
            stripeRows: true,
            columnLines: true,
            columns: [{
                id: 'time',
                text: 'Time',
                width: 75,
                sortable: true,
                dataIndex: 'time'
            }, {
                text: 'level',
                width: 75,
                sortable: true,
                dataIndex: 'level'
            }, {
                text: 'Message',
                flex: 1,
                sortable: true,
                dataIndex: 'message'
            }],
            listeners: {
                afterrender: function() {
                    this._loadLastEvents();
                }.bind(this)
            }
        });

        this.callParent(arguments);
    }
});
