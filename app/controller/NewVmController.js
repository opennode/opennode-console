Ext.define('opennodeconsole.controller.NewVmController', {
    extend: 'Ext.app.Controller',

    views: ['compute.NewVmView'],
    stores: ['ComputesStore'],

    refs: [
        {ref: 'window', selector: 'window.newvm'},
        {ref: 'form', selector: 'window.newvm form'}
    ],

    init: function() {
        this.control({
            'window.newvm form': {
                beforerender: function(sender) {
                    // sender.getForm().url = BACKEND_PREFIX + this.getWindow().parentCompute.getChild('vms').get('url');
                }
            },
            '#create-new-vm-button': {
                click: function(sender) {
                    var form = this.getForm().getForm();
                    if (form.isValid()) {
                        var data = form.getFieldValues();
                        var virtualizationContainer = this.getWindow().parentCompute.getChild('vms');
                        var url = BACKEND_PREFIX + virtualizationContainer.get('url');
                        Ext.Ajax.request({
                            url: url,
                            jsonData: data,
                            success: function(response) {
                                var ret = Ext.JSON.decode(response.responseText);
                                if (!ret['success']) {
                                    var errors = ret['errors'];
                                    form.markInvalid(errors);
                                } else {
                                    var compute = Ext.create('opennodeconsole.model.Compute', ret['result']);
                                    virtualizationContainer.children().add(compute);
                                    this.getWindow().destroy();
                                }
                            },
                            failure: function(response) {
                                console.error(response.responseText);
                            },
                            scope: this
                        });
                    }
                }
            }
        });
    }
});
