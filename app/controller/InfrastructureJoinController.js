Ext.define('Onc.controller.InfrastructureJoinController', {
    extend: 'Ext.app.Controller',

    views: ['InfrastructureJoinView'],
    models: ['ManagedNode'],
    stores: ['RegisteredNodesStore', 'IncomingNodesStore'],

    refs: [
        {ref: 'window', selector: 'window.infrastructurejoin'},
        {ref: 'form', selector: 'window.infrastructurejoin form'}
    ],

    view: null,

    init: function(){
        this.control({
            '#infrastructurejoin-button':{
                click: function() {
                    this.view = this.getView('InfrastructureJoinView').create();
                    this.view.show();
                    this._load();
                }
            },

            '#infrastructureJoin':{
                'hostAccept': function(source, eventObject){
                    var url = '/machines/incoming/{0}/actions/accept'.format(hostname);

                    Onc.Backend.request('PUT', url, {
                       success: function(response) {
                           this._load();
                       }.bind(this),
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
                           this._load();
                       }.bind(this),
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
                           this._load();
                       }.bind(this),
                       failure: function(response) {
                           console.error(response.responseText);
                       }
                   });
                }
            }
        });
    },

    _load: function(){
        this.getStore('IncomingNodesStore').load();
        this.getStore('RegisteredNodesStore').load();
    }
});
