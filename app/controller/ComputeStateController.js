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
        computeDeleteStarted: function(vm) {
            //this._enableCsControls(false, [vm]);
            Ext.ComponentQuery.query('computestatecontrol[computeId=' + vm.getId() + ']').forEach(function(c) {
                c.el.mask("Deleting ...", "x-mask-msg-suspicious-vm");
            });
        },
        computeDeleteCompleted: function(vm){
            //commented out: after deleting comes removing from list, this makes mask reappear before before removing
            //this._enableCsControls(true, [vm]);
        },

        computeStateChanged: function(computeId, value){
            Ext.Array.each(this._getComponentsForId(computeId), function(cmp){
                cmp.refresh();
            });
        }
    },

    init: function() {
        var computeManager = Onc.core.manager.ComputeManager;

        this.control({
            'computestatecontrol': {
                start: function(sender, vm) {
                    computeManager.start([vm], function(){});
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
                },
                host: function(sender, vm) {
                    var vmurl = vm.get('url');
                    var parentId = Onc.model.Compute.extractParentId(vmurl);
                    if(parentId != undefined && parentId != null){
                        this.fireBusEvent('openCompute', parentId);
                    }
                }
            }
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
    }

});
