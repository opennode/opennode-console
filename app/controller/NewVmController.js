Ext.define('Onc.controller.NewVmController', {
    extend: 'Ext.app.Controller',

    views: ['compute.NewVmView'],
    stores: ['ComputesStore'],

    refs: [
        {ref: 'window', selector: 'window.newvm'},
        {ref: 'form', selector: 'window.newvm form'}
    ],

    init: function() {
        var me = this;
        this.control({
            '#create-new-vm-button': {
                click: function(sender) {
                    var form = this.getForm().getForm();
                    if (form.isValid()) {
                        var data = form.getFieldValues();
                        var virtualizationContainer = this.getWindow().parentCompute.getChild('vms');
                        var url = Onc.Backend.url(virtualizationContainer.get('url'));
                        Ext.Ajax.request({
                            url: url,
                            jsonData: data,
                            success: function(response) {
                                var ret = Ext.JSON.decode(response.responseText);
                                if (!ret['success']) {
                                    form.markInvalid(ret['errors']);
                                } else {
                                    var compute = new Onc.model.Compute(ret['result']);
                                    virtualizationContainer.children().add(compute);
                                    // XXX: Temporary
                                    Ext.getStore('ComputesStore').add(compute);
                                    me.getWindow().destroy();
                                }
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
