Ext.define('Onc.controller.MigrateController', {
    extend: 'Ext.app.Controller',

    busListeners: {
           startMigrate : function() {
               alert('Started');
           },

            stopMigrate : function() {
                alert('Stopped');
            }
    }




});
