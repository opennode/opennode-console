Ext.define('Onc.controller.ZabbixRegistrationController', {
    extend: 'Ext.app.Controller',

    views: ['compute.ZabbixRegistrationView'],

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
                    console.log('to je to');
                }
            }
        });
    }
});
