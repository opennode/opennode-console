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

    busListeners: {
        displayHostManager: function() {
            this.view = this.getView('InfrastructureJoinView').create();
            this.view.show();
            this._load();
        }
    },

    init: function(){
        this.control({
            '#infrastructureJoin':{
                'hostAccept': function(source, hostname){
                    var url = '/machines/incoming/salt/{0}/actions/accept'.format(hostname);
                    
					var store = this.getStore('IncomingNodesStore');
					var record = store.findRecord('hostname',hostname); 
				
					if(record!= null){
						console.log("Setting status=accepting for host:"+hostname+", status before: "+record.get("status"));
						record.set("status","accepting");
					}else console.log("Record not found in store:"+hostname);
				
                    Onc.core.Backend.request('PUT', url, {
                       success: function(response) {
                           this._load(false);
                       }.bind(this),
                       failure: function(response) {
                           console.error('Accept host action failed: ' + response.responseText);
                       }
                   });
                },
                'hostReject': function(source, hostname){
                    var url = '/machines/incoming/salt/{0}/actions/reject'.format(hostname);

                    Onc.core.Backend.request('PUT', url, {
                       success: function(response) {
                           this._load(false);
                       }.bind(this),
                       failure: function(response) {
                           console.error('Reject host action failed: ' + response.responseText);
                       }
                   });
                },
                'hostDelete': function(source, hostname){
                    var url = '/machines/by-name/{0}'.format(hostname);

                    var store = this.getStore('RegisteredNodesStore');
					var record = store.findRecord('hostname',hostname); 
				
					if(record!= null){
						console.log("Setting status=deleting for host:"+hostname+", status before: "+record.get("status"));
						record.set("status","deleting");
					}else console.log("Record not found in store:"+hostname);
                    
                    
                    Onc.core.Backend.request('DELETE', url, {
                       success: function(response) {
                           this._load(false);
                       }.bind(this),
                       failure: function(response) {
                           console.error('Delete host action failed: ' + response.responseText);
                       }
                   });
                },
                'reload': function(source){
                    this._load(true);
                }
            }
        });
    },

  _load: function(doReload) {
	
		if (doReload == false) {
			console.log("Not reloading store");
			var store = this.getStore('TasksStore').load();
			var syncRecord = store.findRecord("cmdline", "[sync: paused]"); // store.getById(6);
			if (syncRecord){
				Ext.Msg.show({
					title : 'Sync daemon not running',
					msg : 'Accepted host will not be visible till the next execution of the sync process. Currently the process is paused.',
					buttons : Ext.Msg.OK,
					icon : Ext.Msg.WARNING
				});
			}else{
				console.log("This should not be reaload");
			}
		}else{
			this.getStore('IncomingNodesStore').load();
			this.getStore('RegisteredNodesStore').load();
		}
	}
});
