Ext.define('Onc.controller.DashboardController', {
    extend: 'Ext.app.Controller',

    stores: ['ComputesStore', 'PhysicalComputesStore'],

    busListeners: {
        getRunningServices: function(){
            this._getRunningServices();
        }
    },

    _getRunningServices: function(){
        var url = '/proc';
        Onc.core.Backend.request('PUT', url, {
           success: function(response) {
            this._load();
           }.bind(this),
            failure: function(response) {
                console.error('Request failed: ' + response.responseText);
        }
        });
    },

    _getPendingActions: function() {},
    _getRunningTasks: function() {},
    _getLastestEvents: function() {}

});