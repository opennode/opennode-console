Ext.define('Onc.view.NotificationBarView', {
    extend: 'Ext.Component',
    alias: 'widget.notificationBar',

    hidden: true,

    msgCt: null,

    msg: function(title, messageText){
        Ext.MessageBox.alert(title, messageText);
     },

    displayMessage: function(messageText, messageType){
        this.msg(messageType, messageText);
    }
});
