Ext.define('Onc.Proxy', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.onc',

    doRequest: function(operation, callback, scope) {
        // BEGIN COPY-PASTE FROM SUPERCLASS
        var writer  = this.getWriter(),
            request = this.buildRequest(operation, callback, scope);

        if (operation.allowWrite()) {
            request = writer.write(request);
        }

        Ext.apply(request, {
            headers       : this.headers,
            timeout       : this.timeout,
            scope         : this,
            callback      : this.createRequestCallback(request, operation, callback, scope),
            method        : this.getMethod(request),
            disableCaching: false // explicitly set it to false, ServerProxy handles caching
        });

        // BEGIN OVERRIDE
        var url = request.url;
        var method = request.method;
        delete request.url;
        delete request.method;

        Onc.Backend.request(method, url, null, request);

        request.url = url;
        request.method = method;
        // END OVERRIDE

        return request;
        // END COPY-PASTE FROM SUPERCLASS
    }
});