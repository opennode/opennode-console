Ext.define('opennodeconsole.widgets.Vnc', {
    extend: 'Ext.Container',
    alias: 'widget.vnc',
    cls: 'webvnc',
    html: '<div><canvas width="1024" height="768"></canvas><input class="input-focus" style="position: absolute; top: -10000; left: -10000; width: 0px; height: 0px;"></input></div>',

    listeners: {
        'afterrender': function() {
            var me = this;

            $(this.el.dom).find("canvas").click(function() {
                $(me.el.dom).find(".input-focus").focus();
            });

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

            this.rfb = RFB({target: $(this.el.dom).find('canvas')[0],
                            focusContainer: $(this.el.dom).find('.input-focus')[0],
                            onUpdateState: updateState});

            this.autoReconnecting = true;
            reconnect();
        },
        'beforedestroy': function() {
            this.autoReconnecting = false;
        }
    }
})
