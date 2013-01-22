Ext.define('Onc.controller.MigrateController', {
    extend: 'Ext.app.Controller',

    busListeners: {
           startMigrate : function(options) {
               this.migrate(options);
           }
    },

    migrate: function(options) {
        var msg = 'Migrate {0} from {1} to {2}?'.format(options.nodeName, options.srcHost, options.destHost);
        Ext.MessageBox.confirm('Confirm', msg, showResult);
        function showResult(btn){
            if ('yes' == btn) {
                var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
                myMask.show();
                var url = '/computes/{0}/actions/migrate?arg=/machines/{1}'.format(options.computeId, options.machineId);
                Onc.core.Backend.request('PUT', url, {
                    success: function(response) {
                        var ret = Ext.JSON.decode(response.responseText);
                        //Onc.controller.MigrateController.checkStatus(ret.pid);
                    }.bind(this),
                    failure: function(response) {
                        console.error('Error on migration: ' + response.responseText);
                    }
                });
                setTimeout(function () {myMask.hide();} , 5000);
            }
        };
    },

    checkStatus: function(pid) {
        var url = "/proc/completed/" + pid;
        Onc.core.Backend.request('GET', url, {
            success: function(response) {
                var ret = Ext.JSON.decode(response.responseText);
                console.log(ret);
            }.bind(this),
            failure: function(response) {

            }
        });
    }



});
