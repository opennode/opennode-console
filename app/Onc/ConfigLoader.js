Ext.define('Onc.ConfigLoader', {
    singleton: true,

    load: function(url) {
        Ext.Ajax.request({
            method: 'GET',
            url: url,
            async: false,
            success: function(response) {
                eval(response.responseText);
            },
            failure: function() {
                console.warn("No {0} file found".format(url));
            }
        });
    }
});