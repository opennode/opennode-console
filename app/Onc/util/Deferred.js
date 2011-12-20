Ext.define('Onc.util.Deferred', {
    callbacks: null,
    errbacks: null,

    constructor: function() {
        this.callbacks = [];
        this.errbacks = [];
    },

    success: function(callback) {
        if (this._result)
            callback(this._result)
        else
            this.callbacks.push(callback);
        return this;
    },
    except: function(errback) {
        if (this._error)
            errback(this._error);
        else
            this.errbacks.push(errback);
        return this;
    },

    callback: function(result) {
        this._result = result;
        this.callbacks.forEach(function(c) { c(result); });
        delete this.callbacks;
    },

    errback: function(exception) {
        this._exception = exception;
        this.errbacks.forEach(function(c) { c(exception); });
        delete this.errbacks;
    }
});