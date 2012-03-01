Ext.define('Onc.Backend', {
    extend: 'Ext.util.Observable',
    requires: ['Onc.util.Deferred'],
    singleton: true,

    constructor: function() {
        this.addEvents('loginrequired');
    },

    request: function(method, url, options, request) {
        options = options || {};
        var successCodes = options.successCodes || [];
        delete options.successCodes;

        // This is (primarily) to support Onc.backend.Proxy:
        var callbackFn;
        if (request && request.callback) {
            callbackFn = request.callback;
            delete request.callback;
        } else {
            callbackFn = options.callback || Ext.emptyFn;
            delete options.callback;
        }
        var opts = {
            url: '{0}{1}'.format(BACKEND_PREFIX, url),
            method: method,
            withCredentials: true,

            callback: function(_, success, response) {
                var result;
                try {
                    result = Ext.decode(response.responseText);
                } catch (ex) {
                    console.error("Error parsing JSON response:");
                    console.error(response.responseText);
                }
                if (!success) {
                    if (response.status === 403 && !(403 in successCodes)) {
                        this.fireEvent('loginrequired');
                    } else {
                        d.errback(result, response);
                    }
                } else {
                    d.callback(result, response);
                }

                callbackFn.apply(window, arguments);
            }.bind(this)
        };

        var keys = Ext.Object.getKeys(opts);
        console.assert(keys.every(function(k) { return !(k in options); }),
                       "Request options shouldn't specify any of {0}".format(keys.join(', ')));
        Ext.apply(options, opts);

        if (request) {
            for (var key in options) {
                if (request.hasOwnProperty(key))
                    console.warn("'%s' property of request will be overwritten", key);
            }
            Ext.apply(request, options);
            Ext.Ajax.request(request);
        } else {
            Ext.Ajax.request(options);
        }

        var d = new Onc.util.Deferred();
        return d;
    }
});