Ext.define('Onc.controller.ComputeController', {
    extend: 'Ext.app.Controller',

    views: ['compute.ComputeStateControl'],

    refs: [
        {ref: 'computeInfo', selector: 'computeview'},
        {ref: 'tabs', selector: '#mainTabs'}
    ],


    busListeners: {
        computeAdd: function(vm){
            if (!vm.isDeployed()) {
                // we ignore such VMs in ONC display
                return;
            }
            this.fireBusEvent('displayNotification', 'New Virtual Machine created');
            vm.loadParent(
                function(hn){
                    vmList = this._getVMListCmp(hn.get('id'));
                    if (vmList && vmList.getStore().indexOf(vm) == -1) {
                        vmList.getStore().add(vm);
                    }
                }.bind(this),
                function(operation){
                    console.error('Error while loading parent: ', operation);
                }.bind(this)
            );
        },

        computeRemove: function(vmId, url){
            // remove deleted VM from vmList component on parent's compute tab
            var parentId = Onc.model.Compute.extractParentId(url);
            var vmList = this._getVMListCmp(parentId);
            if(vmList){
                var store = vmList.getStore();
                var index = store.findExact('id', vmId);
                if(index !== -1)
                    store.removeAt(index);
            }
        },

        computeStateChanged: function(computeId, value){
            var tabPanel = this.getTabs();
            var tab = tabPanel.getActiveTab();
            if (tab && tab.computeId === computeId) {
                tab.updateTabs();
            }
        },

        computeFeaturesChanged: function(computeId, newFeatures) {
            var isNowDeployed = Onc.model.Compute.containsDeployedFeature(newFeatures);
            Ext.getStore('ComputesStore').loadById(computeId,
                function(compute) {
                    if (compute.isDeployed() && !isNowDeployed)
                        Onc.core.EventBus.fireEvent('computeRemove', compute.get('id'), compute.get('url'));
                    else if (isNowDeployed)
                        Onc.core.EventBus.fireEvent('computeAdd', compute);
                },
                function(error) {
                    console.error('Error while loading data: ', error);
                    return;
                }
            );
        }
    },

    init: function() {
        var computeManager = Onc.core.manager.ComputeManager;

        this.control({
            'computeview computevmlisttab #new-vm-button': {
                click: function(sender) {
                    this.fireBusEvent('displayNewVMDialog', this.getComputeInfo().record);
                }
            },
            'computeview computevmlisttab': {
                groupStart: function(vms) {
                    computeManager.start(vms);
                },
                groupStop: function(vms) {
                    computeManager.graceful(vms);
                }
            },
            'computesystemtab #zabbix-button': {
                click: function() {
                    this.fireBusEvent('displayZabbixDialog');
                }
            }
        });
    },

    _getVMListCmp: function(hnId){
        var tabPanel = this.getTabs();
        return tabPanel.child('computeview[computeId=' + hnId + '] computevmlisttab');
    }

});
