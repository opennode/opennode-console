Ext.define('opennodeconsole.tabs.VncTab', {
    extend: 'opennodeconsole.tabs.Tab',
    alias: 'widget.computevnctab',

    layout: 'fit',

    initComponent: function() {
        this.items = [{
            xtype: 'vnc',
            url: (this.vncConfig || {}).url
        }];
        this.callParent(arguments);
    }

});
