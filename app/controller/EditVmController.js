Ext.define('Onc.controller.EditVmController', {
    extend: 'Ext.app.Controller',

    views: ['compute.EditVmView'],
    stores: ['ComputesStore'],

    refs: [
        {ref: 'window', selector: 'window.editvm'},
        {ref: 'form', selector: 'window.editvm form'}
    ],

    busListeners: {
        displayEditVMDialog: function(event){
            this.getView('compute.EditVmView').create({
                parentCompute: event.hn,
                compute: event.compute
            }).show();
        }
    },

    init: function() {
        var me = this;
        this.control({
            '#edit-vm-button': {
              click: function(){
                 var form = this.getForm().getForm();
                     if (form.isValid()) {
                         var data = form.getFieldValues();
                         var compute = this.getWindow().compute;

                         compute.set('num_cores', data.num_cores);
                         compute.set('memory', data.memory);
                         compute.get('diskspace').total = data.diskspace * 1024;
                         compute.set('swap_size', data.swap_size * 1024);

                         compute.save({
                           success: function(ret) {
                                 me.getWindow().destroy();
                             },
                             failure: function(response) {
                                 console.error(response.responseText);
                             }
                         });
                     }
                }
            }
        });
    }
});
