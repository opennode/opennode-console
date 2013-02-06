Ext.define('Onc.core.util.Completer', {

    constructor: function() {
       this.finalizers = [];
    },

    callAndCheck: function(pid, successCb, errorCb) {
        this._check(pid, 0, successCb, errorCb);
    },

    _check: function(pid, retryAttempt, successCb, errorCb) {
        var maxRetryAttempts = 100;
        var retryPeriod = 1; //seconds
        if (maxRetryAttempts > retryAttempt) {
            var url = "/proc/completed/" + pid;
            Onc.core.Backend.request('GET', url, {successCodes: [404]}, {
                success: function(response) {
                        successCb(response);
                },
                failure: function(request, response) {
                    setTimeout(function () {
                        this._check(pid, retryAttempt+1, successCb, errorCb)}.bind(this), retryPeriod * 1000);
                }.bind(this)
            });
        } else {
            errorCb;
        }

    }

});
