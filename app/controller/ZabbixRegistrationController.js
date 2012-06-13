Ext.define('Onc.controller.ZabbixRegistrationController', {
    extend: 'Ext.app.Controller',

    views: ['compute.ZabbixRegistrationView'],

    refs: [
           {ref: 'zbwindow', selector: 'window.zabbix'},
           {ref: 'form', selector: 'window.zabbix form'},
           {ref: 'computesystemtab', selector: '#systemtab'}
       ],

    init: function() {
        this.control({
            'computesystemtab #zabbix-button': {
                click: function() {
                    this.getView('compute.ZabbixRegistrationView').create({
                        // TODO: remove example store
                        hostGroupStore: [
                           ['1', 'One'], ['2', 'Two'], ['3', 'Three'], ['4', 'Four'],
                           ['5', 'Five'], ['6', 'Six'], ['7', 'Seven'], ['8', 'Eight']
                       ]
                    }).show();
                    ;
                }
            },
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
                }//.bind(this)
            }
        });
    },

    _createObserver: function(vm, callback) {
        this.__proto__ = {
            connect: function() {
                this.subscription = Onc.hub.Hub.subscribe(this.onDataFromHub.bind(this), {'compute': vm.get('url')}, 'zabbix');
                this.timerId = setTimeout(function() {
                    console.log('* timedout');
                    this.finished();
                }.bind(this), 3000);
            },

            onDataFromHub: function(values) {
                values.compute.forEach(function(el) {
                    var eo = el[1];
                    console.log(eo.name);
                    if(eo.name === 'IZabbixRegistered')
                        this.finished();
                }, this);
            },

            finished: function() {
                console.log('finishing');
                clearTimeout(this.timerId);
                this.subscription.unsubscribe();
                callback();
            }
        };
    }
});


Ext.apply(Ext.form.field.VTypes, {
         IPAddress:  function(v) {
             return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v);
         },
         IPAddressText: 'Must be a numeric IP address',
         IPAddressMask: /[\d\.]/i
 });
