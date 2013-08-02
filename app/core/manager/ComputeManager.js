Ext.define('Onc.core.manager.ComputeManager', {
    singleton: true,

    // Compute Actions

    destroy: function(vm, callback) {
        Onc.core.EventBus.fireEvent('computeDeleteStarted', vm);

        var url = 'bin/rm?arg=/computes/' + vm.get('id');

        if (!vm.isUndeployed()) {
            var url = 'computes/' + vm.get('id') + '/actions/undeploy';
        }

        Onc.core.Backend.request('PUT', url, {
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

    allocate: function(vm) {
        this._setStateAndWait([vm], 'allocate');
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
                if(desiredState == 'allocate')
                    action += 'allocate';

                Onc.core.Backend.request('PUT', url + action, {
                    success: function(response) {
                        // TODO switch to using task response code
                        // special check 
                        if (desiredState == 'allocate') {
                            var stdout = JSON.parse(response.responseText).stdout[0];
                            if (stdout.startswith('Found no fitting machines')) {
                               Onc.core.EventBus.fireEvent('displayNotification',
                                    'There were no matching resources. Please retry in some time.',
                                    'Allocation failed');
                               // remove the mask from controls too
                               var cntrls = Ext.ComponentQuery.query('computestatecontrol[computeId=' +
                                    vm.get('id') + ']')
                               Ext.Array.each(cntrls, function(cmp){
                                    if (cmp.el.isMasked()) {
                                        cmp.el.unmask();
                                    }
                                });
                               
                            }
                            
                        }

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
