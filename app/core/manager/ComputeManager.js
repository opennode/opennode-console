Ext.define('Onc.core.manager.ComputeManager', {
    singleton: true,

    // Compute Actions

    destroy: function(vm, callback) {
        Onc.core.EventBus.fireEvent('computeDeleteStarted', vm);

        var url = vm.get('url');
        Onc.core.Backend.request('DELETE', url, {
            success: function(response) {
                Onc.core.EventBus.fireEvent('computeDeleteCompleted', vm);
            },
            failure: function(response) {
                console.error(response.responseText);
                Onc.core.EventBus.fireEvent('computeDeleteCompleted', vm);
            }
        });
    },

    start: function(vms) {
        this._setStateAndWait(vms, 'active');
    },

    graceful: function(vms) {
        this._setStateAndWait(vms, 'inactive');
    },


    // compute Observer

    _setStateAndWait: function(vms, desiredState) {

        // notify that state transition started
        this.fireBusEvent('computesStateChangeStarted', {vms:vms, desiredState:desiredState});

        Ext.each(vms, function(vm) {
            if(vm.get('state') != desiredState) {
                var url = "/computes/" + vm.get('id') + "/";
                var action = 'actions/';
                if(desiredState == 'active')
                	action += 'start';
            	else if(desiredState == 'inactive')
                	action += 'shutdown';
                	
				Onc.core.Backend.request('PUT', url + action, {
					success: function(response) {
						//state end comes with sync
					}.bind(this),
					failure: function(response) {
						console.error('Changing compute state to "' + desiredState + '" failed: ' + response.responseText);
					}
				});
            }
        }, this);

    },

    // TODO: move to abstract Manager class
    fireBusEvent: function(eventName, args) {
        Onc.core.EventBus.fireEvent(eventName, args);
    }

});
