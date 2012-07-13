Ext.define('Onc.controller.MainController', {
    extend: 'Ext.app.Controller',

    models: ['Base', 'Compute', 'IpRoute', 'Storage', 'Template', 'VirtualizationContainer', 'Hangar',
             'Templates', 'NetworkInterface', 'NetworkInterfaces'],
    stores: ['ComputesStore', 'PhysicalComputesStore', 'TemplatesStore'],
    views: ['compute.ComputeView'],

    refs: [{ref: 'tabs', selector: '#mainTabs'}],

    openComputeInTab: function(computeId) {
        var tabPanel = this.getTabs();
        var tab = tabPanel.child('computeview[computeId=' + computeId + ']');
        if (!tab) {
            this.getStore('ComputesStore').loadById(computeId,
                function(compute) {
                    tab = Ext.widget('computeview', {
                        record: compute,
                        computeId: computeId
                    });
                    tabPanel.add(tab);
                    tabPanel.setActiveTab(tab);
                },
                function(error) {
                    // TODO: visual display of the error
                    return;
                }
            );
        } else {
            tabPanel.setActiveTab(tab);
        }
    },

    busListeners: {
        openCompute: function(computeId){
          this.openComputeInTab(computeId);
        },

        computeRemove: function(vmId, url){
            console.log('* bus event (MainController): computeRemove + computeId');
            // close deleted VM compute tab
            var tabPanel = this.getTabs();
            var tab = tabPanel.child('computeview[computeId=' + vmId + ']');
            if(tab)
                tabPanel.remove(tab);
        }

    },

    init: function() {
        this.control({
            '#mainTabs': {
                tabchange: function(tabPanel, newTab) {
                    var computeId = newTab.computeId;
                    this.fireBusEvent('computeDisplayed', computeId);
                }
            },
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
            '#infrastructurejoin-button':{
                click: function() {
                    this.fireBusEvent('displayHostManager');
                }
            }
        });
    }
});
