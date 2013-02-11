Ext.define('Onc.controller.MigrateController', {
    extend: 'Ext.app.Controller',

    busListeners: {
           startMigrate : function(options) {
               this.showConfirmation(options);
           }
    },

    showConfirmation: function(options) {
        var msg = "Are you sure you want to migrate <b>{0}</b> from <b>{1}</b> to <b>{2}</b>?".format(options.nodeName,
                    options.srcHost, options.destHost);
        Ext.MessageBox.confirm('Confirm', msg, showResult.bind(this));
        function showResult(btn){
            if ('yes' == btn) {
                this.migrate(options);
            }
        };
    },

    migrate : function(options) {
        var myMask = new Ext.LoadMask(options.vmmap, {msg:'Migrating {0}. Please wait...'.format(options.nodeName)});
        myMask.show();
        console.log(options.vmState, options.vmState === 'inactive');
        var offlineMigration = options.vmState === 'inactive' ? '&offline' : ''; 
        var url = '/computes/{0}/actions/migrate?arg=/machines/{1}&asynchronous=1{2}'.format(options.computeId,
                        options.destMachineId, offlineMigration);
        Onc.core.Backend.request('PUT', url, {
            success: function(response) {
                var ret = Ext.JSON.decode(response.responseText);
                this.checkStatus(ret.pid, options, myMask, 0);
            }.bind(this),
            failure: function(response) {
                
                console.error('Error during migration: ' + response.responseText);
            }
        });
    },

    checkStatus: function(pid, options, myMask, retryAttempt) {
        var maxRetryAttempts = 100;
        var retryPeriod = 3; //seconds
        if (maxRetryAttempts > retryAttempt) {
            var url = "/proc/completed/" + pid;
            Onc.core.Backend.request('GET', url, {successCodes: [404]}, {
                success: function(response) {
                    var taskStdout = JSON.parse(response.responseText).stdout[0];
                    if (taskStdout.startswith('Failed migration')) {
                        myMask.hide();
                        Ext.MessageBox.show({
                           title: 'Migration failure',
                           msg: 'Migration failed: {0}'.format(taskStdout),
                           buttons: Ext.MessageBox.OK,
                           icon: Ext.MessageBox.ERROR
                        });
                        return;
                    }
                    this.verifyMigratedVM(options, myMask);
                }.bind(this),
                failure: function(request, response) {
                    setTimeout(function () {
                        this.checkStatus(pid, options, myMask, retryAttempt+1)}.bind(this),
                            retryPeriod * 1000);
                }.bind(this)
            });
        } else {
            myMask.hide();
            Ext.MessageBox.show({
               title: 'Migration task timeout',
               msg: 'Migration has timed out. The task is still running but appears hung.',
               buttons: Ext.MessageBox.OK,
               icon: Ext.MessageBox.ERROR
            });
        }
    },

    verifyMigratedVM: function(options, myMask) {
            var url = "/machines/{0}/vms/{1}?attrs=status,stdout".format(options.srcMachineId, options.computeId);
            Onc.core.Backend.request('GET', url, {successCodes: [404]}, {
                success: function(response) {
                    // if we see VM in it's previous location, it's a failure, no need to redraw.
                    myMask.hide();
                    Ext.MessageBox.show({
                       title: 'Migration failed',
                       msg: 'Node migration has failed - the VM was not moved. Please, check agent logs for the exact reason.',
                       buttons: Ext.MessageBox.OK,
                       icon: Ext.MessageBox.ERROR
                    });
                },
                failure: function(request, response) {
                    myMask.hide();
                    var vmmap = Ext.getCmp('vmmap');
                    Ext.MessageBox.show({
                       title: 'Migration succeeded',
                       msg: '<b>"{0}"</b> was successfully migrated.'.format(options.nodeName),
                       buttons: Ext.MessageBox.OK,
                       icon: Ext.MessageBox.INFO,
                       fn: function() {
                            vmmap.store.reload();
                            vmmap.doLayout();
                        }
                    }); 
                }
            });
    }
});
