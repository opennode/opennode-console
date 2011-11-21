Ext.define('opennodeconsole.controller.ComputeController', {
    extend: 'Ext.app.Controller',

    views: ['compute.NewVmView'],

    refs: [
        {ref: 'computeInfo', selector: 'computeview'}
    ],

    init: function() {
        this.control({
            'computeview computestatustab #new-vm-button': {
                click: function() {
                    this.getView('compute.NewVmView').create({
                        parentCompute: this.getComputeInfo().record
                    }).show();
                }
            }
        });

    }
});
