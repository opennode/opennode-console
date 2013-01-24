Ext.define('Onc.controller.RetryController', {
    extend: 'Ext.app.Controller',

    busListeners: {
        showRetryProgress: function(timeoutPeriod){
            this.showProgress(timeoutPeriod);
        },
        hideRetryProgress: function() {
            this.hideProgress();
        }
    },

    showProgress : function(timeoutPeriod) {
        Ext.MessageBox.show({
            title        : 'Wait',
            msg          : 'OMS is not responding, retrying in ' + timeoutPeriod + ' seconds',
            progress     : false,
            closable     : false
        });
    },

    hideProgress : function() {
        Ext.MessageBox.hide();
    }
});
