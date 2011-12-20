Ext.define('Onc.controller.LoginController', {
    extend: 'Ext.app.Controller',

    views: ['LoginWindow', 'Viewport'],

    refs: [{ref: 'searchResults', selector: '#search-results'},
           {ref: 'tabs', selector: '#mainTabs'}],

    _viewport: null,

    init: function() {
        Onc.Backend.on('loginrequired', function() {
            if (this._viewport)
                this._viewport.destroy();
            this.getView('LoginWindow').create();
        }.bind(this));

        Onc.Backend.request('GET', 'auth')
            .success(this.onAuth.bind(this))
            .except(function(response) {
                console.assert(response.status === 403);
            });

        this.control({
            'loginwindow': {
                login: function(token) {
                    this.onAuth();
                }.bind(this)
            }
        });
    },

    onAuth: function() {
        Onc.hub.Hub.run();
        Ext.getStore('ComputesStore').load();
        this._viewport = this.getView('Viewport').create();
    }
});
