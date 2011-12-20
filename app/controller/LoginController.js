Ext.define('Onc.controller.LoginController', {
    extend: 'Ext.app.Controller',

    views: ['LoginWindow', 'Viewport'],

    refs: [{ref: 'searchResults', selector: '#search-results'},
           {ref: 'tabs', selector: '#mainTabs'}],

    _viewport: null,

    init: function() {
        var me = this;

        Ext.Ajax.withCredentials = true;

        Ext.Ajax.on('requestexception', function() {
            if (me._viewport)
                me._viewport.destroy();
            me.getView('LoginWindow').create();
        });

        Ext.Ajax.request({
            url: BACKEND_PREFIX + 'auth',
            method: 'POST',
            withCredentials: true,
            success: function(response) {
                me.onAuth();
            },
            failure: function(response) {
                console.assert(response.status === 403);
            }
        });

        this.control({
            'loginwindow': {
                login: function(token) {
                    me.onAuth();
                }
            }
        });
    },

    onAuth: function() {
        Onc.hub.Hub.run();
        Ext.getStore('ComputesStore').load();
        this._viewport = this.getView('Viewport').create();
    }
});
