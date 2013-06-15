Ext.define('Onc.core.util.Scheduler', {
    singleton: true,

    constructor: function() {
        Function.prototype.schedule = this.schedule;
    },

    schedule: function(options) {
        var self = this;
        if (!options.fn) options.fn = this;
        setTimeout(
            function() {
                var d = options.fn();
                if (options.repeat) {
                    if (!d)
                        throw new Error("Callback should return a deferred");
                    d.finallyDo(function() {
                        setTimeout(function() {
                            self.schedule(options);
                        }, options.wait);
                    });
                }
            },
            options.repeat ? 0 : options.wait
        );
    }
});