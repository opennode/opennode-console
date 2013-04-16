Ext.define('Onc.portal.LogPortlet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.logportlet',
    uses: ['Ext.data.ArrayStore'],
    height: 250,
    border: false,
    store: Ext.create('Ext.data.ArrayStore', {
        fields: [{
            name: 'time'
        }, {
            name: 'level'
        }, {
            name: 'message'
        }],
	sorters: [{
	    property: 'time',
	    direction: 'DESC'
	}]
    }),

    _loadLastEvents: function() {
        var me = this;
        var eventContainer = this.up("#logPortlet");
        eventContainer.setLoading(true);
        Onc.core.Backend.request('PUT', 'bin/catlog?arg=-n&arg=60').success(function(response) {
            if (response.stdout) {
                for ( var i = 0; i < response.stdout.length; i++) {
                    // get the log components
                    var message = response.stdout[i];
                            
                    var date = message.substr(0, message.indexOf(" "));
                    message = message.substr(message.indexOf(" ") + 1);
                    var time = message.substr(0, message.indexOf(" "));
                    message = message.substr(message.indexOf(" ") + 1);
                    var level = message.substr(0, message.indexOf(" "));
                    message = message.substr(message.indexOf(" ") + 1);
                    if (time && level) {
                        var d = {
                             'time': date + " " + time,
                             'message': message,
                             'level': level
                        };

                        this.store.add(d);
                    }// not correct line
                }   
	            eventContainer.setLoading(false);
                } else {
		    console.log('Event log processing failed due to a missing log output')
                    // eventCmp.update('<b>/proc/completed/ does not return stdout</b>');
                    eventContainer.setLoading(false);
                }
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
                width: 130,
                sortable: true,
                dataIndex: 'time'
            }, {
                text: 'Level',
                width: 60,
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
