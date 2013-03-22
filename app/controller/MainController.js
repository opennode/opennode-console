Ext.define('Onc.controller.MainController', {
    extend: 'Ext.app.Controller',

    models: ['Base', 'Compute', 'IpRoute', 'Storage', 'Template', 'VirtualizationContainer', 'Hangar',
             'Templates', 'NetworkInterface', 'NetworkInterfaces'],
    stores: ['ComputesStore', 'PhysicalComputesStore', 'TemplatesStore'],
    views: ['compute.ComputeView','compute.GaugesChartView'],

    refs: [{ref: 'tabs', selector: '#mainTabs'}],

    openComputeInTab: function(computeId) {
        var tabPanel = this.getTabs();
        var tabId = 'computeview[computeId=' + computeId + ']';
        var tab = tabPanel.child(tabId);
        if (!tab) {
            var placeholderTabId = 'dummy-computeview-tab-' + computeId;
            if (tabPanel.child('#' + placeholderTabId)) {
                return; // placeholder tab already in place
            }
            tab = new Ext.Panel ({
                id: placeholderTabId,
                title: 'Loading...'
            });
            tabPanel.add(tab);
            tabPanel.setActiveTab(tab);
            var loadingMask = new Ext.LoadMask(tab, {msg:'Please wait while loading VM...'});
            loadingMask.show();

            this.getStore('ComputesStore').loadById(computeId,
                function(compute) {
                    loadingMask.hide();
                    tabPanel.remove(tab);
                    tab = Ext.widget('computeview', {
                        record: compute,
                        computeId: computeId
                    });
                    tabPanel.add(tab);
                    tabPanel.setActiveTab(tab);
                }.bind(this),

                function(error) {
                    // TODO: visual display of the error
                    console.error('Error while loading data: ', error);
                    this.fireBusEvent('displayNotification', error, 'Error');
                    return;
                }
            );
        } else {
            tabPanel.setActiveTab(tab);
            this.fireBusEvent('computeDisplayed', computeId);
        }
    },

    openGaugesChartInTab: function(compute) {
        var tabPanel = this.getTabs();
        var computeId=compute.get('id');
        var tabId = 'gaugeschart[computeId=' + computeId + ']';
        var tab = tabPanel.child(tabId);
        if (!tab) {
            tab=Ext.widget('gaugeschartview', {
                compute: compute,
                computeId: computeId,
                store: Ext.create('Ext.data.JsonStore', {
                    fields: ['timestamp', 'cpu', 'memory', 'diskspace', 'network'],
                    data: [],
                    sorters: ['timestamp']
                }),
            });
            tabPanel.add(tab);
            tabPanel.setActiveTab(tab);
        } else {
            tabPanel.setActiveTab(tab);
        }
    },

    busListeners: {
        openCompute: function(computeId){
          this.openComputeInTab(computeId);
        },
        
        openGaugesChart: function(compute){
            this.openGaugesChartInTab(compute);
        },
        
        computeRemove: function(vmId, url){
            // close deleted VM compute tab
            var tabPanel = this.getTabs();
            var tab = tabPanel.child('computeview[computeId=' + vmId + ']');
            if(tab)
                tabPanel.remove(tab);
        }

    },

    // TODO: move global variables to separate locator class
    logViewerAppender: null,
    logViewer: null,

    init: function() {
        this.logViewerAppender = new Sm.log.LogViewerAppender();
        Sm.log.Logger.getRoot().addAppender(this.logViewerAppender);

        // set log level if LOG_LEVEL defined in config.js
        if(LOG_LEVEL)
            Sm.log.Logger.getRoot().setLevel(Sm.log.Level[LOG_LEVEL]);

        var log = Sm.log.Logger.getLogger( 'UI');

        this.control({
            '#vmmap': {
                showvmdetails: function(computeId) {
                    this.openComputeInTab(computeId);
                },
                newvm: function(parentCompute) {
                    this.fireBusEvent('displayNewVMDialog', parentCompute);
                }
            },
            '#tasks-button': {
                click: function() {
                    this.fireBusEvent('displayTaskManager');
                }
            },
            '#newapp-button': {
                click: function() {
                    this.fireBusEvent('displayNewVMDialog', null);
                }
            },
            '#infrastructurejoin-button':{
                click: function() {
                    this.fireBusEvent('displayHostManager');
                }
            },
            '#oms-shell-button':{
                click: function() {
                    this.fireBusEvent('displayOmsShell');
                }
            },
            '#re-register-gauges' : {
				click : function() {
					console.log("Re-registering all gauges.");
					var gauges=Ext.ComponentQuery.query('[cls~=gauge]');//alias with dots not working
					console.log("Gauges found:"+gauges.length);
					Ext.Array.each(gauges, function(item) {
								item.reSubscribe();
					}, this);
				}
			},
            '#viewlog-button': {
                click: function(){
                    // Create a log window
                    if(!this.logViewer){
                        this.logViewer = new Sm.log.LogViewerWindow({
                            appender : this.logViewerAppender,
                            minimizable: true
                        });
                        this.logViewer.on({
                            close: function(win, eOpts){
                                log.info('Log viewer closed - logs cleared');
                                this.logViewer = null;
                            },
                            // minimize implemented because closing viewer clear log list
                            minimize: function(win, eOpts){
                                log.info('Log viewer minimized');
                                win.hide();
                            },
                            scope: this
                        });
                        log.info('Log viewer created');
                    }
                    this.logViewer.setVisible(!this.logViewer.isVisible());
                    log.info('Log viewer displayed');
                }
            }
        });
    }
});
