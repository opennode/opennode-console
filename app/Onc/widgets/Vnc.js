Ext.define('Onc.widgets.Vnc', {
    extend: 'Ext.Container',
    alias: 'widget.vnc',
    cls: 'webvnc',
    html: (
        '<div>' +
          '<canvas width="1024" height="768"></canvas>' +
          '<input class="input-focus" style="position: absolute; top: -10000; left: -10000; width: 0px; height: 0px;"></input>' +
        '</div>'
    ),

    _rfb: null,
    _request: null,

    listeners: {
        'afterrender': function() {
            var me = this;

            var canvasEl = this.el.down('canvas');
            var inputFocusEl = this.el.down('.input-focus');

            canvasEl.on('click', function() {
                inputFocusEl.focus();
            });

            this._rfb = RFB({
                target: canvasEl.dom,
                focusContainer: inputFocusEl.dom,
                onUpdateState: function(rfb, state, oldState, msg) {
                    console.assert(!me.isDestroyed);
                    if (state === 'disconnected')
                        me._connect();
                }
            });

            this._connect();
        },

        'beforedestroy': function() {
            if (this._rfb) {
                this._rfb.disconnect();
                delete this._rfb;
            }
            if (this._request) {
                this._request.abort();
                delete this._request;
            }
        }
    },

    _connect: function() {
        var me = this;
        me._request = Ext.Ajax.request({
            url: BACKEND_PREFIX + me.url,
            success: function(result) {
                var jsonData = Ext.JSON.decode(result.responseText);
                var wsUri = $.url.parse(jsonData['ws_url']);
                me._rfb.connect(wsUri.host, wsUri.port, '', '');
            },
            failure: function() {
                if (me._autoReconnecting){
                    console.log("cannot get vnc console, reconnecting in 4 sec");
                    setTimeout(function() { me._connect(); }, 4000);
                } else {
                    console.log("cannot get vnc console, autoreconnect disabled for this tab");
                }
            }
        });
    }
})
