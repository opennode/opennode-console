Ext.define('Onc.core.util.Deferred', {
    callbacks: null,
    errbacks: null,
    finalizers: null,

    _result: undefined,
    _exArgs: undefined,

    constructor: function() {
        this.callbacks = [];
        this.errbacks = [];
        this.finalizers = [];
    },

    success: function(fn) {
        if (this._result)
            fn.apply(this, this._result)
        else
            this.callbacks.push(fn);
        return this;
    },
    failure: function(fn) {
        if (this._exArgs)
            fn.apply(this, this._exArgs);
        else
            this.errbacks.push(fn);
        return this;
    },
    finally: function(fn) {
        if (this._exArgs || this._result)
            fn.apply(this, [this._result ? true : false].concat(this._result || this._exArgs));
        else
            this.finalizers.push(fn);
        return this;
    },

    callback: function() {
        this._result = Array.prototype.slice.call(arguments, 0);
        this.callbacks.forEach(function(c) { c.apply(this, this._result); }.bind(this));
        this.finalizers.forEach(function(c) { c.apply(this, [true].concat(this._result)); }.bind(this));
        delete this.callbacks;
        delete this.finalizers;
    },

    errback: function() {
        this._exArgs = Array.prototype.slice.call(arguments, 0);;
        this.errbacks.forEach(function(c) { c.apply(this, this._exArgs); }.bind(this));
        this.finalizers.forEach(function(c) { c.apply(this, [false].concat(this._exArgs)); }.bind(this));
        delete this.errbacks;
        delete this.finalizers;
    },

    trigger: function(fn) {
        return function() {
            try {
                this.callback(fn.apply(null, arguments));
            } catch(err) {
                console.log("Got unhandled exception while asynchrnously triggering a deferred callback", fn, err);
                this.errback(err);
            }
        }.bind(this);
    },

    triggerErrback: function(fn) {
        return function() {
            try {
                this.errback(fn.apply(null, arguments));
            } catch(err) {
                console.log("Got unhandled exception while asynchrnously triggering a deferred errback", fn, err);
                this.errback(err);
            }
        }.bind(this);
    }
});
