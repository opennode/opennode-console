Ext.define('Onc.controller.MigrateController', {
    extend: 'Ext.app.Controller',

    busListeners: {
           startMigrate : function(options) {
               //this.checkStatus(1141,options, new Ext.LoadMask(options.vmmap, {msg:"Migrating. Please wait..."}));
               this.showConfirmation(options);
           }
    },

    showConfirmation: function(options) {
        var msg = "Migrate <b>{0}</b> from <b>{1}</b> to <b>{2}</b>?".format(options.nodeName, options.srcHost, options.destHost);
        Ext.MessageBox.confirm('Confirm', msg, showResult.bind(this));
        function showResult(btn){
            if ('yes' == btn) {
                this.migrate(options);
            }
        };
    },

    migrate : function(options) {
        var myMask = new Ext.LoadMask(options.vmmap, {msg:"Migrating. Please wait..."});
        myMask.show();
        var url = '/computes/{0}/actions/migrate?arg=/machines/{1}'.format(options.computeId, options.machineId);
        Onc.core.Backend.request('PUT', url, {
            success: function(response) {
                var ret = Ext.JSON.decode(response.responseText);
                this.checkStatus(ret.pid, options, myMask);
            }.bind(this),
            failure: function(response) {
                console.error('Error on migration: ' + response.responseText);
            }
        });
    },

    checkStatus: function(pid, options, myMask) {
        var url = "/proc/completed/" + pid;
        Onc.core.Backend.request('GET', url, {successCodes: [404]}, {
            success: function(response) {
                var ret = Ext.JSON.decode(response.responseText);
                myMask.hide();
                options.vmmap.doLayout();
                //TODO need to show success message?
            },
            failure: function(response) {
                //TODO: need to implement retry mechanism
                //console.error('Error on migration: ' + response.responseText);

                //setTimeout("this.checkStatus(pid, options)", 3000);
            }
        });
    }



});
