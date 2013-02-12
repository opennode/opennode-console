Ext.define('Onc.controller.LoginController', {
    extend: 'Ext.app.Controller',
    require: ['Onc.model.AuthenticatedUser', 'Onc.core.util.Completer'],

    views: ['LoginWindow', 'Viewport'],

    refs: [{ref: 'searchResults', selector: '#search-results'},
           {ref: 'tabs', selector: '#mainTabs'}],

    _viewport: null,

    init: function() {
        Onc.core.Backend.on('loginrequired', this._login.bind(this));

        Onc.core.Backend.request('GET', 'auth')
            .success(this._onAuth.bind(this))
            .failure(function(response) {
                console.assert(response.status === 403);
            });

        this.control({
            'loginwindow': {
                login: function(token) {
                    this._onAuth();
                }.bind(this)
            },
            '#logout-button': {
                click: function() {
                    Onc.core.Backend.request('GET', 'logout');
                    this._login();
                }
            }
        });
    },

    _login: function() {
        if (this._viewport){
            if(this._viewport.getXType() == 'loginwindow'){
                return; // do nothing if the login window is already up
            }
            this._viewport.destroy();
        }
        Ext.WindowMgr.each(function(w) {
            if (w.modal && !w.hidden) {
                w.destroy();
            }
        });
        Onc.model.AuthenticatedUser.reset();
        this._viewport = this.getView('LoginWindow').create();
    },

    _onAuth: function() {
        // XXX Needs refactoring once a more elegant role reporting is implemented, possibly as art 
        // make a query to get user roles
        var me = this;
        var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Loading..."});
        myMask.show();
        Onc.core.Backend.request('PUT', 'bin/id')
            .success(function(response) {
                    Onc.model.AuthenticatedUser.parseIdCommand(response);
                    me._onRoleKnown();
                    myMask.hide();
            })
            .failure(function(response) {
                    Ext.MessageBox.alert('Status', 'Login failed');
                    myMask.hide();
                    me._login();
            });
    },

    _onRoleKnown: function() {
        Onc.core.hub.Hub.run();
        var cstore = Ext.getStore('SearchResultsStore');
        if (Onc.model.AuthenticatedUser.isAdmin())
            cstore.getProxy().extraParams['q'] = 'virt:no';
        else
            cstore.getProxy().extraParams['q'] = 'virt:yes';
        cstore.load();
        if (this._viewport)
            this._viewport.destroy();
        this._viewport = this.getView('Viewport').create();
    }
});
