Ext.define('Onc.controller.ZabbixRegistrationController', {
    extend: 'Ext.app.Controller',

    stores: ['ZabbixHostgroupsStore'],
    views: ['compute.ZabbixRegistrationView'],

    refs: [
        {ref: 'zbwindow', selector: 'window.zabbix'},
        {ref: 'form', selector: 'window.zabbix form'}
    ],

    busListeners: {
        displayZabbixDialog: function(vms){
            var zabbixStore = this.getStore('ZabbixHostgroupsStore');
            zabbixStore.load();
            this.getView('compute.ZabbixRegistrationView').create().show();
        }
    },

    init: function() {
        this.control({
            '#save-zabbix-regitration-button': {
                click: function(sender) {
                    var win = this.getZbwindow();
                    win.setDisabled(true);
                    var form = this.getForm().getForm();
                    if (form.isValid()) {
                        var data = form.getFieldValues();
                        var compute = this.getComputesystemtab().record;

                        // add IZabbixConfiguration to features array
                        var myfeatures = Ext.Array.clone(compute.get('features'));
                        myfeatures.push('IZabbixConfiguration');
                        compute.set('features', []);
                        compute.set('features', myfeatures);

                        compute.save({
                            success: function(val){
                                // set zabbix attributes
                                compute.set('zabbix_hostgroups', data.multiselect);
                                compute.set('zabbix_agent_port', data.agent_port);
                                if(data.dns_name){
                                    compute.set('zabbix_dns_name', data.dns_name);
                                    compute.set('zabbix_use_dns', true);
                                } else if(data.ipv4_address){
                                    compute.set('zabbix_ipv4_address', data.ipv4_address);
                                    compute.set('zabbix_use_dns', false);
                                }
                                compute.save ({
                                    success: function(val){
                                        // create observer and wait for IZabbixRegistered notification
                                        var vmObserver = new this._createObserver(compute, function(){
                                            this.getZbwindow().destroy();
                                        }.bind(this));
                                        vmObserver.connect();
                                    }.bind(this),
                                    failure: function(val, operation){
                                        this.getZbwindow().destroy();
                                    }.bind(this),
                                });
                            }.bind(this),
                            failure: function(val, operation){
                                this.getZbwindow().destroy();
                            }
                        });
                    }
                }
            }
        });
    },

    _createObserver: function(vm, callback) {
        this.__proto__ = {
            connect: function() {
                this.subscription = Onc.core.hub.Hub.subscribe(this.onDataFromHub.bind(this), {'compute': vm.get('url')}, 'zabbix');
                this.timerId = setTimeout(function() {
                    this.finished();
                }.bind(this), 3000);
            },

            onDataFromHub: function(values) {
                values.compute.forEach(function(el) {
                    var eo = el[1];
                    if(eo.name === 'IZabbixRegistered')
                        this.finished();
                }, this);
            },

            finished: function() {
                clearTimeout(this.timerId);
                this.subscription.unsubscribe();
                callback();
            }
        };
    }
});


Ext.apply(Ext.form.field.VTypes, {
         IPAddress:  function(v) {
           var ValidIpAddressRegex = /(^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)|(^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$)/;
             return ValidIpAddressRegex.test(v);
         },
         IPAddressText: 'Invalid Hostname or IP address',
         IPAddressMask: /[-.a-zA-Z0-9]/
 });
