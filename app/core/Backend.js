Ext.define('Onc.core.Backend', {
    extend: 'Ext.util.Observable',
    requires: ['Onc.core.util.Deferred'],
    singleton: true,
    retryCounter: 0,
    retryPeriods: [2, 5, 10, 30, 60], //in seconds
    maxRetryAttempts: 60,

    constructor: function() {
        this.callParent(arguments);
        this.addEvents('loginrequired');
    },

    url: function(url) {
            return Ext.BACKEND_PREFIX + url.replace(/^\//,'');
    },

    ajaxRequest: function(request, options) {
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
    },

    request: function(method, url, options, request) {
        options = options || {};
        var successCodes = options.successCodes || [];
        delete options.successCodes;

        // This is (primarily) to support Onc.core.backend.Proxy:
        var callbackFn;
        if (request && request.callback) {
            callbackFn = request.callback;
            delete request.callback;
        } else {
            callbackFn = options.callback || Ext.emptyFn;
            delete options.callback;
        }

        var opts = {
            url: this.url(url),
            method: method,
            withCredentials: true,

            callback: function(_, success, response) {
                var emptyResponse = (response.status === 0 && response.responseText.length === 0);
                if (!success && (response.status === 403) && !(response.status in successCodes)) {
                    this.fireEvent('loginrequired');
                } else if (!(response.status in successCodes) && (!success || emptyResponse)) {
                    if (this.retryCounter > this.maxRetryAttempts) {
                        this.retryCounter = 0;
                        this.fireEvent('loginrequired');
                    } else if (emptyResponse) {
                        this.retryCounter++;
                        var timeoutPeriod;
                        if (this.retryPeriods.length > this.retryCounter) {
                            timeoutPeriod = this.retryPeriods[this.retryCounter-1];
                        } else {
                            timeoutPeriod = this.retryPeriods[this.retryPeriods.length-1];
                        }
                        Onc.core.EventBus.fireEvent("showRetryProgress", timeoutPeriod);
                        setTimeout(function() {
                                    Onc.core.Backend.ajaxRequest(request, options);
                                    Onc.core.EventBus.fireEvent("hideRetryProgress");
                                }, timeoutPeriod * 1000);
                    } else if (response.status.toString().indexOf('5') == 0) {
						Ext.Msg.show({
							title : 'Server error ' + response.status,
							msg : (response.responseText)
									? "<div style='overflow: scroll; width: 480px;height: 425px;'><pre>"
											+ response.responseText
											+ "</pre></div>"
									: "Server error has occured!",
							buttons : Ext.MessageBox.OK,
							width : 500,
							height : 500
						});
					} 
                } else {
					if (this.retryCounter > 0) {
						this.retryCounter = 0;
					}
                    if (!success) {
                       d.errback(response);
                    } else {
                        try {
                            result = Ext.decode(response.responseText);
                        } catch (ex) {
                            console.error("Error parsing JSON response:");
                            console.error(response.responseText);
                        }
                        d.callback(result, response);
                    }
                    callbackFn.apply(window, arguments);
                }
            }.bind(this)
        };

        var keys = Ext.Object.getKeys(opts);
        console.assert(keys.every(function(k) { return !(k in options); }),
                       "Request options shouldn't specify any of {0}".format(keys.join(', ')));
        Ext.apply(options, opts);

        this.ajaxRequest(request, options);

        var d = new Onc.core.util.Deferred();
        return d;
    }
});
