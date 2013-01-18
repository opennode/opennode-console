Ext.define('Onc.controller.MigrateController', {
    extend: 'Ext.app.Controller',

    busListeners: {
           startMigrate : function() {
               this.migrationStarted();
           },

            stopMigrate : function() {
                alert('Stopped');
            }
    },

    migrationStarted: function() {
        Ext.MessageBox.confirm('Confirm', 'Are you sure you want to start migration?', showResult);
        function showResult(btn){
            if ('yes' == btn) {
                var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
                myMask.show();
                var url = '/computes/a165fa62-9949-488a-a229-cfb952aa1edd/actions/migrate?arg=/machines/a165fa62-9949-488a-a229-cfb952aa1edd';
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
