Ext.define('Onc.controller.ComputeStateController', {
    extend: 'Ext.app.Controller',

    views: ['compute.ComputeStateControl'],

    refs: [
        {ref: 'csControl', selector: 'computestatecontrol'}
    ],


    busListeners: {
        computesStateChangeStarted: function(vms){
            this._enableCsControls(false, vms);
        },
        computesStateChangeCompleted: function(vms){
            this._enableCsControls(true, vms);
        },
        computeDeleteStarted: function(vm){
            this._enableCsControls([vm], false);
        },
        computeDeleteCompleted: function(vm){
            this._enableCsControls([vm], true);
        },

        computeStateChanged: function(computeId, value){
            Ext.Array.each(this._getComponentsForId(computeId), function(cmp){
                cmp.refresh();
            });
        }
    },

    init: function() {
        var computeManager = Onc.manager.ComputeManager;

        this.control({
            'computestatecontrol': {
                start: function(sender, vm) {
                    computeManager.start([vm], function(){});
                },
                stop: function(sender, vm) {
                    computeManager.stop([vm]);
                },
                suspend: function(sender, vm) {
                    computeManager.suspend([vm]);
                },
                graceful: function(sender, vm) {
                    computeManager.graceful([vm]);
                },

                edit: function(sender, vm) {
                    vm.loadParent(
                        function(hn){
                            this.fireBusEvent('displayEditVMDialog', {hn: hn, compute: vm});
                        }.bind(this),
                        function(operation){
                            console.error('Error while loading parent: ', operation);
                        }.bind(this)
                    );
                },
                'delete': function(sender, vm) {
                    computeManager.destroy(vm);
                },
                details: function(sender, vm) {
                    this.fireBusEvent('openCompute', vm.get('id'));
                }
            },
        });
    },


    // Helper methods

    _enableCsControls: function(enabled, vms){
        // enable / disable all ComputeStateControl components for each VM from list
        Ext.Array.each(vms, function(vm){
            Ext.Array.each(this._getComponentsForId(vm.get('id')), function(cmp){
                cmp.setDisabled(!enabled, vms);
            });
        }, this);
    },

    _getComponentsForId: function(vmId){
        return Ext.ComponentQuery.query('computestatecontrol[computeId=' + vmId + ']');
    },

});
