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
                this._streamSubscribe(vms, callback, 'active');
            },
            vmsstop: function(vms, callback) {
                this._streamSubscribe(vms, callback, 'inactive');
            },
            vmssuspend: function(vms, callback) {
                this._streamSubscribe(vms, callback, 'inactive');
            },
            vmsgraceful: function(vms, callback) {
                this._streamSubscribe(vms, callback, 'inactive');
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

    _streamSubscribe: function(vms, callback, desiredState){
        var observers = [];
        var stateChangeCount = 0;

        var timerId = setTimeout(function(){
            console.log('* timedout');
            // disconnect still connected observers
            Ext.each(observers, function(observer) {
                observer.disconnect();
            });
            onCompleted();
        }, 30000);

        var onVMStateChanged = function(){
            console.log('# enter onVMStateChanged');
            stateChangeCount++;
            if(stateChangeCount === observers.length){
                console.log('* all vms changed status');
                onCompleted();
            }
        };

        var onCompleted = function(){
            console.log('# enter onCompleted');
            clearTimeout(timerId);
            callback();
        };

        Ext.each(vms, function(vm) {
            if(vm.get('state') === desiredState){
                console.log(vm.get('hostname') + ': compute already in ' + desiredState + ' state - skipping');
            }
            else {
                var vmObserver = this._createObserver(vm, desiredState, onVMStateChanged);
                observers.push(vmObserver);
                vmObserver.changeState();
            }
        }, this);

        if(observers.length == 0){
            console.log('* 0 computes scheduled for state change - canceling');
            onCompleted();
        }
    },

    _createObserver: function(vm, desiredState, vmStateChangedCallback){
        return {
            compute: vm,
            hubListener: null,

            changeState: function(){
                vm.set('state', desiredState);
                vm.save();
                this.log('start state change to ' + desiredState);
                this.connect();
            },

            onDataFromHub: function(values){
                var i = 0;
                var cnt = values.compute.length;
                for(i = 0; i < cnt; i++){
                    var eo = (values.compute[i])[1];
                    this.log ('  event -- ' + eo.event + ', ' + eo.name + ', ' + eo.old_value + ', ' + eo.value);
                    if(eo.name === 'effective_state' && eo.value === desiredState){
                        this.log('state changed to ' + desiredState);
                        this.disconnect();
                        vmStateChangedCallback();
                        break;
                    };
                }
            },

            connect: function() {
                this.hubListener = this.onDataFromHub.bind(this);
                Onc.hub.Hub.subscribe(this.hubListener, {'compute': this.compute.get('url')}, 'features2');
                this.log('subscribed');
            },

            disconnect: function() {
                if(this.hubListener !== null){
                    Onc.hub.Hub.unsubscribe(this.hubListener);
                    this.hubListener = null;
                    this.log('unsubscribed');
                }
            },

            log: function(msg){
                console.log('  ' + this.compute.get('hostname') + ': ' + msg);
            }
        };
    }
});
