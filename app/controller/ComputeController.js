Ext.define('Onc.controller.ComputeController', {
    extend: 'Ext.app.Controller',

    views: ['compute.ComputeStateControl'],

    refs: [
        {ref: 'computeInfo', selector: 'computeview'},
        {ref: 'tabs', selector: '#mainTabs'}
    ],


    busListeners: {
        computesStateChangeStarted: function(vms){
            this._enableVMLists(vms, true);
        },
        computesStateChangeCompleted: function(vms){
            this._enableVMLists(vms, false);
        },
        computeDeleteStarted: function(vm){
            this._enableVMLists([vm], true);
        },
        computeDeleteCompleted: function(vm){
            this._enableVMLists([vm], false);
        },
        computeAdd: function(vm){
            this.fireBusEvent('displayNotification', 'New Virtual Machine created');
            vm.loadParent(
                function(hn){
                    vmList = this._getVMListCmp(hn.get('id'));
                    if(vmList)
                        vmList.getStore().add(vm);
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
        }
    },


    init: function() {
        var computeManager = Onc.manager.ComputeManager;

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
                    computeManager.stop(vms);
                },
            },
            'computesystemtab #zabbix-button': {
                click: function() {
                    this.fireBusEvent('displayZabbixDialog');
                }
            }
        });
    },


    _enableVMLists: function(vms, enabled){
        var hnComputes = {};
        var loaded = 0;
        var count = vms.length;
        Ext.Array.each(vms, function(vm){
            vm.loadParent(function(hn){
                hnComputes[hn.get('id')] = hn;
                if(++loaded === count){
                    for(var hnId in hnComputes){
                        var grid = this._getVMListCmp(hnId);
                        if (grid) {
                            grid.setLoading(enabled);
                        }
                    }
                }
            }.bind(this),
            function(){
                console.error('error loading parent');
            });
        }, this);
    },

    _getVMListCmp: function(hnId){
        var tabPanel = this.getTabs();
        return tabPanel.child('computeview[computeId=' + hnId + '] computevmlisttab gridpanel');
    }

});
