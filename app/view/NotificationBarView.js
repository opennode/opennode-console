Ext.define('Onc.view.NotificationBarView', {
    extend: 'Ext.Component',
    alias: 'widget.notificationBar',

    hidden: true,

    msgCt: null,

    createBox: function(t, s) {
       return '<div class="msg"><h3>' + t + '</h3><p>' + s + '</p></div>';
    },

    msg: function(title, format){
        if (!this.msgCt){
            this.msgCt = Ext.core.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
        }
        var s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
        var m = Ext.core.DomHelper.append(this.msgCt, this.createBox(title, s), true);
        m.hide();
        m.slideIn('t').ghost("t", { delay: 2500, remove: true});
     },

    displayMessage: function(messageText, messageType){
        this.msg(messageType, messageText);
    }
});
