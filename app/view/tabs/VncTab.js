Ext.define('Onc.view.tabs.VncTab', {
    extend: 'Onc.view.tabs.Tab',
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
