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
            console.log('* timedout');
            // signal connected observers that we are done
            Ext.each(observers, function(observer) {
                observer.finished();
            });

        }, 30000);

        function checkCompleted() {
            if(observers.length == 0) {
                console.log('* no more computes to wait for');
                clearTimeout(timerId);
                callback();
            }
        }

        function onVMStateChanged(observer) {
            console.log('# enter onVMStateChanged', observer);
            observers.remove(observer);
            checkCompleted()
        }

        Ext.each(vms, function(vm) {
            if(vm.get('state') === desiredState) {
                console.log(vm.get('hostname') + ': compute already in ' + desiredState + ' state - skipping');
            } else {
                var vmObserver = new this._createObserver(vm, desiredState, onVMStateChanged);
                observers.push(vmObserver);
                vmObserver.changeState();
            }
        }, this);

        checkCompleted();
    },

    _createObserver: function(vm, desiredState, vmStateChangedCallback) {
        this.__proto__ = {
            changeState: function() {
                vm.set('state', desiredState);
                vm.save();
                this.log('start state change to ' + desiredState);
                Onc.hub.Hub.subscribe(this.onDataFromHub, {'compute': vm.get('url')}, 'state_change');
                this.log('subscribed');
            },

            onDataFromHub: function(values) {
                values.compute.forEach(function(el) {
                    var eo = el[1];
                    this.log ('  event -- ' + eo.event + ', ' + eo.name + ', ' + eo.old_value + ', ' + eo.value);
                    if(eo.name === 'effective_state' && eo.value === desiredState){
                        this.log('state changed to ' + desiredState);
                        this.finished();
                    };
                }, this);
            }.bind(this),

            finished: function() {
                Onc.hub.Hub.unsubscribe(this.onDataFromHub);
                vmStateChangedCallback(this);
            }

            log: function(msg) {
                console.log('  ' + vm.get('hostname') + ': ' + msg);
            }
        };
    }
});
