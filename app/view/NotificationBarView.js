Ext.define('Onc.view.NotificationBarView', {
    extend: 'Ext.Component',
    alias: 'widget.notificationBar',

    hidden: true,

    msgCt: null,

    msg: function(title, format){
    	Ext.MessageBox.alert(title, format);
     },

    displayMessage: function(messageText, messageType){
        this.msg(messageType, messageText);
    }
});
