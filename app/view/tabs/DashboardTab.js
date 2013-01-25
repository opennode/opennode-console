Ext.define('Onc.view.tabs.DashboardTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computedashboardtab',

    autoScroll: true,
    bodyPadding: 0,
    _storeLoaded: false,

    listeners: {
        activate: function () {
        	this._loadRunningServices();
            this._loadLastEvents();
        }
    },
 
    _loadLastEvents: function() {
        var eventCmp = this.down("#latest-events");
        eventCmp.setLoading(true);
        Onc.core.Backend.request('PUT', 'bin/catlog?arg=-n&arg=30')
            .success(function(response) {
                var logs = response.stdout[0].split('\n');
                var msg = '<ol>';
                for (var i = 0; i < logs.length; i++) {
                    // get the log components
                    msg += '<li>' + logs[i] + '</li>';
                }
                msg += '</ol>';
                eventCmp.update(msg);
                eventCmp.setLoading(false);
            })
            .failure(function(response) {
                console.assert(response.status === 403);
                eventCmp.update('<b>Event log loading failed with status ' + response.status + '</b>');
                eventCmp.setLoading(false);
            });
    },
    _loadRunningServices: function() {
    	var serviceCmp1 = this.down("#running-services1"); 
    	serviceCmp1.setLoading(true);
    	
    	Onc.core.Backend.request('GET', 'machines/?depth=3&attrs=diskspace,memory,__type__')
    		.success(function(response) {
    			console.debug(response);
    			var physServers = 0;
    			var physCloudServers = 0;
    			var physHACloudServers = 0;
    			var subnets = 0;
    			var virtMachines = 0;
    			var assignedRam = 0;
    			var assignedHDD = 0;
    			
    	    	
    	    	for(var i = 0; i < response.children.length; i++){
    	    		var serv = response.children[i];
    	    		if(serv.__type__ == 'Compute'){
	    	    		physServers++;
	    	    		physCloudServers++;
	    	    		assignedHDD += serv.diskspace.total;
	    	    		assignedRam += parseInt(serv.memory,10);
	    	    		for(var j = 0; j < serv.children.length; j++){
	    	    			var child = serv.children[j];
	    	    			if(child.__type__ == 'VirtualizationContainer'){
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
    	    	serviceCmp1.update(msg);
    			serviceCmp1.setLoading(false);
    		})
    		.failure(function(response) {
    			console.assert(response.status === 403);
    			serviceCmp1.update('<b>Running Services loading failed with status ' + response.status + '</b>');
                serviceCmp1.setLoading(false);
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
                        xtype: 'container',
                        padding: 5
                    },
                    items:[{
                        xtype: 'toolbar',
                        items: [
                            '->',
                            {
                            text: 'Refresh',
                            handler: function() {
                                me._loadRunningServices();
                            }
                        }]
                    }, {
                        xtype: 'displayfield',
                        itemId: 'running-services1',
                    },{
                    	xtype: 'displayfield',
                		itemId: 'running-services2',
                    }]
//                    [{
//                        html: '# physical servers'
//                    }, {
//                        html: '# cloud servers'
//                    }, {
//                        html: '# HA cloud servers'
//                    }, {
//                        html: '# subnets'
//                    }, {
//                        html: '# Virtual machines'
//                    }, {
//                        html: '# of assigned RAM'
//                    }, {
//                        html: '# of assigned disk space'
//                    }]
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