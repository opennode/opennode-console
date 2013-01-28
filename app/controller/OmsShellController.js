Ext.define('Onc.controller.OmsShellController', {
    extend: 'Ext.app.Controller',

    views: ['OmsShellView', 'Viewport'],

    view: null,

    busListeners: {
        displayOmsShell: function(ev) {
            this.view = this.getView('OmsShellView').create();
            this.view.show();
        }
    }

});
