Ext.define('Onc.view.NotificationBarView', {
    extend: 'Ext.Component',
    alias: 'widget.notificationBar',

    hidden: true,

    displayMessage: function(messageText, messageType){
        Ext.example.msg('', messageText);
    }

});
