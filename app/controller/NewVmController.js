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
            '#tagger': {
                tagAdded: function(source, eventObject){
                    console.log('tagAdded event');
                },
                'tagRemoved': function(source, eventObject){
                    console.log('tagRemoved event');
                }
            },
            '#create-new-vm-button': {
                click: function(sender) {
                    var form = this.getForm().getForm();
                    if (form.isValid()) {
                        var data = form.getFieldValues();

                        // tags
                        var tagger = this.getForm().child('#tags').child('tagger');
                        var tags = tagger.cloneTags();
                        data['tags'] = tags;

                        // cleanup for auto-generated properties from form input fields
                        // TODO: figure out how to exclude input field from Tagger widget to generate properties in form.getFieldValues() call
                        for (var key in data) {
                            if (key.indexOf('ext-') === 0)
                                delete data[key];
                         }

                        var virtualizationContainer = this.getWindow().parentCompute.getChild('vms');
                        var url = virtualizationContainer.get('url');
                        Onc.Backend.request('POST', url, {
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
