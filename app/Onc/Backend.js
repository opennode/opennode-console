Ext.define('Onc.Backend', {
    extend: 'Ext.util.Observable',
    requires: ['Onc.util.Deferred'],
    singleton: true,

    constructor: function() {
        this.addEvents('loginrequired');
    },

    request: function(method, url, opts) {
        var d = new Onc.util.Deferred;

        opts = Ext.apply({}, opts);

        var _opts = {
            url: BACKEND_PREFIX + url,
            method: method,
            withCredentials: true,
            success: function(response) {
                var result = Ext.decode(response.responseText);
                d.callback(result);
            },
            failure: function(response) {
                if (response.status === 403) {
                    this.fireEvent('loginrequired');
                } else {
                    var result = Ext.decode(response.responseText);
                    d.errback(result);
                }
            }.bind(this)
        };

        var keys = Ext.Object.getKeys(_opts);
        console.assert(keys.every(function(k) { return !(k in opts); }),
                       "Request options shouldn't specify any of {0}".format(keys.join(', ')));

        Ext.Ajax.request(Ext.apply(_opts, opts));

        return d;
    }
});