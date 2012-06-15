Ext.define('Onc.controller.InfrastructureJoinController', {
    extend: 'Ext.app.Controller',

    views: ['InfrastructureJoinView'],
    models: ['ManagedNode'],
    stores: ['RegisteredNodesStore', 'IncomingNodesStore'],
    refs: [
           {ref: 'window', selector: 'window.infrastructurejoin'},
           {ref: 'form', selector: 'window.infrastructurejoin form'}
          ],

    init: function(){
        this.control({
            '#infrastructureJoin':{
                'hostAccept': function(source, eventObject){
                    var url = '/machines/incoming/{0}/actions/accept'.format(hostname);

                    Onc.Backend.request('PUT', url, {
                       success: function(response) {
                           console.log('Host Accepted ('+response.responseText+')');
                       },
                       failure: function(response) {
                           console.error(response.responseText);
                       }
                   });
                },
                'hostReject': function(source, eventObject){
                    var url = '/machines/incoming/{0}/actions/reject'.format(hostname);

                    Onc.Backend.request('PUT', url, {
                       success: function(response) {
                           console.log('Host Rejected ('+response.responseText+')');
                       },
                       failure: function(response) {
                           console.error(response.responseText);
                       }
                   });
                },
                'hostDelete': function(source, eventObject){
                    var url = '/machines/by-name/{0}'.format(eventObject);

                    Onc.Backend.request('DELETE', url, {
                       success: function(response) {
                           console.log('Host Deleted ('+response.responseText+')');
                       },
                       failure: function(response) {
                           console.error(response.responseText);
                       }
                   });
                }
            },

            '#infrastructurejoin-button':{
                click: function() {
                    this.getView('InfrastructureJoinView').create({
                        incomingNodesStore: Ext.getStore('IncomingNodesStore'),
                        registeredNodesStore: Ext.getStore('RegisteredNodesStore')
                    }).show();
                }
            }
        });
    }
});
