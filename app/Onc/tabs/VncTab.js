Ext.define('Onc.tabs.VncTab', {
    extend: 'Onc.tabs.Tab',
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
