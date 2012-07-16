Ext.define('Onc.view.NotificationBarView', {
    extend: 'Ext.Component',
    alias: 'widget.notificationBar',

    renderTo: Ext.getBody(),
    renderTpl: [
        '<div class="notificationbar">',
        '<p>{desc}</p>',
        '</div>'
    ],
    renderData: {
        desc: "..."
    },
    renderSelectors: {
        descEl: 'p'
    },

    listeners: {
        afterrender: function(cmp){
            cmp.descEl.addListener('click', function(){
                this.hideMessage();
            }, this);
        }
    },

    hidden: true,

    _timerId: null,


    displayMessage: function(messageText, messageType){
        this._clearTimer();
        this._setMessage(messageText, messageType);
        this._setTimer();

        this.show();
    },

    hideMessage: function(){
        this._clearTimer();
        this.hide();
    },


    _setMessage: function(messageText, messageType){
        this.descEl.dom.innerHTML = messageText;
        this.removeCls(['notificationbar-info', 'notificationbar-error']);
        if(messageType === 'error'){
            this.addCls('notificationbar-error');
        }
        else {
            this.addCls('notificationbar-info');
        }
    },

    _clearTimer: function(){
        if(this._timerId){
            clearTimeout(this._timerId);
            this._timerId = null;
        }
    },

    _setTimer: function(){
        this._timerId = setTimeout(function() {
            this.hideMessage();
        }.bind(this), 10000);
    }
});
