Ext.define('Onc.controller.NotificationBarController', {
    extend: 'Ext.app.Controller',

    views: ['NotificationBarView'],

    refs: [{ref: 'nbar', selector: 'notificationBar'}],

    busListeners: {
        displayNotification: function(messageText, messageType){
            this.view.displayMessage(messageText, messageType);
        },
    },

    view: Ext.create('Onc.view.NotificationBarView'),

});
