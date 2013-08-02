Ext.define('Onc.controller.NewVmController', {
    extend: 'Ext.app.Controller',

    views: ['compute.NewVmView'],
    stores: ['ComputesStore', 'AllocationPolicyStore', 'VmProfilesStore'],

    refs: [
        {ref: 'window', selector: 'window.newvm'},
        {ref: 'form', selector: 'window.newvm form'}
    ],

    busListeners: {
        displayNewVMDialog: function(hn) {
            this.getView('compute.NewVmView').create({
                parentCompute: hn
            }).show();
        }
    },
    
    createVm: function(url, data) {
        Onc.core.Backend.request('POST', url, {
            jsonData: data,
            success: function(response) {
                var ret = Ext.JSON.decode(response.responseText);
                if (!ret['success']) {
                    Ext.getCmp('submitButton').enable();
                    var form = this.getForm().getForm();
                    form.markInvalid(ret['errors']);
                    // special care for the pre-commit check
                    for (var i = 0; i < ret['errors'].length; i++)
                        if (ret['errors'][i]['id'] === 'vm')
                            this.fireBusEvent('displayNotification', ret['errors'][i]['msg'], 'VM creation has failed');
                } else {
					if (url.indexOf("hangar") !== -1) {
						var computeManager = Onc.core.manager.ComputeManager;
						computeManager.allocate(Ext.create(Onc.model.Compute, {
							id : ret['result']['id']
						}));
					}
                    this.getWindow().destroy();
                    this.fireBusEvent('displayNotification', 'Your request was successfully submitted. Stay tuned!', 'New VM request submitted');
                }
                
            }.bind(this),
            failure: function(response) {
                console.error(response.responseText);
                this.fireBusEvent('displayNotification', 'Error occurred while creating new Virtual Machine', 'Error');
            }.bind(this)
        });
    },
    
    createVmInHangar: function(hangarUrl, url, data, backend) {

        // GET to check if url exist
        Onc.core.Backend.request('GET', url, {

            success: function(response) {
                this.createVm(url, data);
            }.bind(this),

            failure: function(response) {

                if (hangarUrl === "") return;// To prevent multiple calls
                // Create backend
                Onc.core.Backend.request('POST', hangarUrl, {
                    jsonData: {
                        'backend': backend
                    },
                    success: function(response) {
                        var ret = Ext.JSON.decode(response.responseText);
                        if (ret['success']) { 
                            var correctUrl = ret['result']['url'];
                            this.createVmInHangar("", correctUrl, data, "");
                            this.fireBusEvent('displayNotification', 'Created hangar VM! Has url:' + correctUrl, 'New hangar VM request submitted');
                        }
                    }.bind(this),
                    failure: function(response) {
                        console.error(response.responseText);
                        this.fireBusEvent('displayNotification', 'Error occurred while creating new hangar VM', 'error');
                    }.bind(this)
                });

            }.bind(this)
        });
    },
    init: function() {

        this.control({
            '#create-new-vm-button': {
                click: function(sender) {
                  
                    var form = this.getForm().getForm();
                    if (form.isValid()) {
                        Ext.getCmp('submitButton').disable();
                        var data = form.getFieldValues();
                        // cleanup for auto-generated properties from form input fields
                        // TODO: figure out how to exclude input field from
                        // Tagger widget to generate properties in form.getFieldValues() call
                        for ( var key in data) {
                            if (key.indexOf('ext-') === 0 || key.indexOf('combobox-') === 0) delete data[key];
                        }
                        var parentCompute = this.getWindow().parentCompute;
                        var hangarUrl = '/machines/hangar';
                        var backend = data['backend'];// get template backend to dynamically create it
                        delete data['backend'];
                        // convert GBs to MBs of diskspace as OMS expects
                        data['diskspace'] = data['diskspace'] * 1024;
                        
                        
                        if (parentCompute) {
                            var url = parentCompute.getChild('vms').get('url');
                            this.createVm(url, data);
                        } else {
                            

                            var url = hangarUrl + '/vms-' + backend;
                            this.createVmInHangar(hangarUrl, url, data, backend)
                        }
                    }
                }
            }
        });
    }
});
