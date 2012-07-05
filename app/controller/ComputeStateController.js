Ext.define('Onc.controller.ComputeStateController', {
    extend: 'Ext.app.Controller',

    views: ['compute.ComputeStateControl'],

    refs: [
        {ref: 'csControl', selector: 'computestatecontrol'}
    ],


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
                 // NOTE: this will fail, we have to implement getParent method to obtain HN from VM
                    this.fireBusEvent('displayEditVMDialog', {hn: vm.getParent(), compute: vm});
                },
                'delete': function(sender, vm) {
                    computeManager.destroy(vm);
                },
                details: function(sender, vm) {
                    this.fireBusEvent('openCompute', vm.get('id'));
                }
            },
        });
    }
});
