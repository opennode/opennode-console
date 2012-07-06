Ext.define('Onc.controller.ComputeController', {
    extend: 'Ext.app.Controller',

    views: ['compute.ComputeStateControl'],

    refs: [
        {ref: 'computeInfo', selector: 'computeview'},
    ],

    busListeners: {
        // TODO:
        // check if component is initiated, if vms belongs to this HN
        computesStateChangeStarted: function(vms){
            this.getComputeInfo().down('grid').setLoading(true);
        },
        computesStateChangeCompleted: function(vms){
            this.getComputeInfo().down('grid').setLoading(false);
        },
        computeDeleteStarted: function(vm){
            this.getComputeInfo().down('grid').setLoading(true);
        },
        computeDeleteCompleted: function(vm){
            this.getComputeInfo().down('grid').setLoading(false);
        },
        computeAdd: function(vm){
            vm.loadParent(
                function(hn){
                    var vmListCmps = Ext.ComponentQuery.query('computeview[computeId=' + hn.get('id') +
                            '] computevmlisttab gridpanel');
                    if(vmListCmps && vmListCmps.length > 0){
                        vmListCmps[0].getStore().add(vm);
                    }
                },
                function(operation){
                    console.error('Error while loading parent: ', operation);
                }.bind(this)
            );
        },
        computeRemove: function(vm){

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
});
