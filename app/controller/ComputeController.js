Ext.define('Onc.controller.ComputeController', {
    extend: 'Ext.app.Controller',

    views: ['compute.NewVmView', 'compute.ComputeStateControl'],

    refs: [
        {ref: 'computeInfo', selector: 'computeview'}
    ],

    init: function() {
        var vmactions = {
            showdetails: function(vm) {
                var computeId = vm.get('id');
                this.getController('MainController').openComputeInTab(computeId);
            },
            vmsdelete: function(vm, callback) {
                var url = vm.get('url');

                Onc.Backend.request('DELETE', url, {
                    success: function(response) {
                        console.log('Host Deleted ('+response.responseText+')');
                        callback();
                    },
                    failure: function(response) {
                        console.error(response.responseText);
                        callback();
                    }
                });
            },
            vmsstart: function(vms, callback) {
                this._setStateAndWait(vms, callback, 'active');
            },
            vmsstop: function(vms, callback) {
                this._setStateAndWait(vms, callback, 'inactive');
            },
            vmssuspend: function(vms, callback) {
                this._setStateAndWait(vms, callback, 'inactive');
            },
            vmsgraceful: function(vms, callback) {
                this._setStateAndWait(vms, callback, 'inactive');
            },
            vmedit: function(vm, callback) {
              var computeId = vm.get('id');
                this.getView('compute.EditVmView').create({
                    parentCompute: this.getComputeInfo().record,
                  compute: vm
                }).show();
            }
        };

        this.control({
            'computeview computevmlisttab #new-vm-button': {
                click: function() {
                    this.getView('compute.NewVmView').create({
                        parentCompute: this.getComputeInfo().record
                    }).show();
                }
            },
            'computeview computevmlisttab': vmactions,
            'computeview computesystemtab': vmactions
        });

    },

    _setStateAndWait: function(vms, callback, desiredState) {
        var observers = [];

        var timerId = setTimeout(function() {
            // signal connected observers that we are done
            Ext.each(observers, function(observer) {
                observer.finished();
            });

        }, 30000);

        function checkCompleted() {
            if(observers.length == 0) {
                clearTimeout(timerId);
                callback();
            }
        }

        function onVMStateChanged(observer) {
            observers.remove(observer);
            checkCompleted();
        }

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
    }
});
