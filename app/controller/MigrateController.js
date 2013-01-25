Ext.define('Onc.controller.MigrateController', {
    extend: 'Ext.app.Controller',

    busListeners: {
           startMigrate : function(options) {
               //this.checkStatus(1141,options, new Ext.LoadMask(options.vmmap, {msg:"Migrating. Please wait..."}), 0);
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
        var url = '/computes/{0}/actions/migrate?arg=/machines/{1}&asynchronous=1'.format(options.computeId, options.destMachineId);
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
                    this.checkMachineState(options, myMask);
                }.bind(this),
                failure: function(request, response) {
                    setTimeout(function () {
                        this.checkStatus(pid, options, myMask, retryAttempt+1)}.bind(this),
                            retryPeriod * 1000);
                }.bind(this)
            });
        } else {
            myMask.hide();
            Ext.MessageBox.alert('Status', 'Node migration has failed');
        }
    },

    checkMachineState: function(options, myMask) {
            var url = "/machines/{0}/vms/{1}".format(options.srcMachineId, options.computeId);
            Onc.core.Backend.request('GET', url, {successCodes: [404]}, {
                success: function(response) {
                    myMask.hide();
                    Ext.MessageBox.alert('Status', 'Node migration has failed');
                },
                failure: function(request, response) {
                    myMask.hide();
                    options.vmmap.doLayout();
                    Ext.MessageBox.alert('Status', '"{0}" was successfully migrated.'.format(options.nodeName));
                }
            });
    }
});