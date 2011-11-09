Ext.define('opennodeconsole.widgets.Vnc', {
    extend: 'Ext.Container',
    alias: 'widget.vnc',
    cls: 'webvnc',
    html: '<canvas width="1024" height="768"/>',

    listeners: {
        'afterrender': function() {
            var me = this;

            function updateState(rfb, state, oldstate, msg) {
                if (state == 'disconnected')
                    reconnect();
            }

            function reconnect() {
                Ext.Ajax.request({url: BACKEND_PREFIX + me.url,
                                  success: function(result) {
                                      var jsonData = JSON.parse(result.responseText);
                                      ws_uri = $.url.parse(jsonData.ws_url);
                                      me.rfb.connect(ws_uri.host, ws_uri.port, '', '');
                                  },
                                  failure: function() {
                                      if (me.autoReconnecting){
                                          console.log("cannot get vnc console, reconnecting in 4 sec");
                                          setTimeout(reconnect, 4000);
                                      } else {
                                          console.log("cannot get vnc console, autoreconnect disabled for this tab");
                                      }

                                  }
                                 });
            }

            this.rfb = RFB({target: $(this.el.dom).children('canvas')[0], onUpdateState: updateState});

            this.autoReconnecting = true;
            reconnect();
        },
        'beforedestroy': function() {
            this.autoReconnecting = false;
        }
    }
})
