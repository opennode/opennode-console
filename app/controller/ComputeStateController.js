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
    }
});
