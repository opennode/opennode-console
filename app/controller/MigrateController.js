Ext.define('Onc.controller.MigrateController', {
    extend: 'Ext.app.Controller',

    busListeners: {
           startMigrate : function(options) {
               this.migrationStarted(options);
           },

            stopMigrate : function() {
                alert('Stopped');
            }
    },

    migrationStarted: function(options) {
        var msg = 'Are you sure you want to start migration from {0} to {1} node?'.format(options.srcHost, options.destHost);
        Ext.MessageBox.confirm('Confirm', msg, showResult);
        function showResult(btn){
            if ('yes' == btn) {
                var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
                myMask.show();
                var url = '/computes/{0}/actions/migrate?arg=/machines/{1}'.format(options.srcId, options.destId);
                Onc.core.Backend.request('PUT', url, {
                    success: function(response) {
                        this._load();
                    }.bind(this),
                    failure: function(response) {
                        console.error('Accept host action failed: ' + response.responseText);
                    }
                });
                setTimeout(function () {myMask.hide();} , 5000);
            }
        };
    }

});
