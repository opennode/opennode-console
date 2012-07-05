Ext.define('Onc.manager.ComputeManager', {
    singleton: true,

    constructor: function(config){
        console.log('** ComputeManager created');
    },


    // Compute Actions

    destroy: function(vm, callback) {
        Onc.EventBus.fireEvent('computeDeleteStarted', vm);

        var url = vm.get('url');
        Onc.Backend.request('DELETE', url, {
            success: function(response) {
                console.log('Host Deleted (' + response.responseText + ')');
                Onc.EventBus.fireEvent('computeDeleteCompleted', vm);
            },
            failure: function(response) {
                console.error(response.responseText);
                Onc.EventBus.fireEvent('computeDeleteCompleted', vm);
            }
        });
    },

    start: function(vms) {
        this._setStateAndWait(vms, 'active');
    },

    stop: function(vms) {
        this._setStateAndWait(vms, 'inactive');
    },

    suspend: function(vms) {
        this._setStateAndWait(vms, 'inactive');
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
                Onc.EventBus.fireEvent('computesStateChangeCompleted', vms);
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
                vm.set('state', desiredState);
                vm.save();

                this.subscription = Onc.hub.Hub.subscribe(this.onDataFromHub.bind(this), {'compute': vm.get('url')}, 'state_change');
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
        Onc.EventBus.fireEvent(eventName, args);
    }

});
