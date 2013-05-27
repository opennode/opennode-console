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
        var observers = [];

        var timerId = setTimeout(function() {
            // signal connected observers that we are done
            Ext.each(observers, function(observer) {
                observer.finished();
            });

        }, 120000);

        function checkCompleted() {
            if(observers.length == 0) {
                clearTimeout(timerId);

                // notify that state transition ended
                Onc.core.EventBus.fireEvent('computesStateChangeCompleted', vms);
            }
        }

        function onVMStateChanged(observer) {
            observers.remove(observer);
            checkCompleted();
        }

        // notify that state transition started
        this.fireBusEvent('computesStateChangeStarted', vms);

        Ext.each(vms, function(vm) {
            if(vm.get('state') != desiredState) {
                var vmObserver = this._createObserver(vm, desiredState, onVMStateChanged);
                observers.push(vmObserver);
                vmObserver.changeState();
            }
        }, this);

        checkCompleted();
    },

    _createObserver: function(vm, desiredState, vmStateChangedCallback) {
        return {
            changeState: function() {
                var url = "/computes/" + vm.get('id') + "/";
                var action = 'actions/';
                if(desiredState == 'active')
                	action += 'start';
            	else if(desiredState == 'inactive')
                	action += 'shutdown';
                	
				Onc.core.Backend.request('PUT', url + action, {
					success: function(response) {

					}.bind(this),
					failure: function(response) {
						console.error('Changing compute state to "' + desiredState + '" failed: ' + response.responseText);
					}
				}); 


                this.subscription = Onc.core.hub.Hub.subscribe(this.onDataFromHub.bind(this), {'compute': vm.get('url')}, 'state_change');
            },

            onDataFromHub: function(values) {
                values.compute.forEach(function(el) {
                    var eo = el[1];
                    if(eo.name === 'effective_state' && eo.value === desiredState)
                        this.finished();
                }, this);
            },

            finished: function() {
                if(this.subscription.subscribed) {
                    this.subscription.unsubscribe();
                    vmStateChangedCallback(this);
                }
            }
        };
    },


    // TODO: move to abstract Manager class
    fireBusEvent: function(eventName, args) {
        Onc.core.EventBus.fireEvent(eventName, args);
    }

});
