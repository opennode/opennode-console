Ext.define('opennodeconsole.controller.ComputeController', {
    extend: 'Ext.app.Controller',

    refs: [
        {ref: 'computeInfo', selector: 'computeview'}
    ],

    init: function() {
        this.control({
            'computeview computestatustab #new-vm-button': {
                click: function() {
                    this.getView('compute.NewVmView').create({
                        parent: this.getComputeInfo().record
                    }).show();
                }
            }
        });

    }
});
