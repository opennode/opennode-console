Ext.define('Onc.view.OmsShellView', {
    extend: 'Ext.window.Window',
    alias: 'widget.omsShellView',

    title: 'OMS Shell',
    modal: true,
    border: false,
    layout: 'fit',
    width: 800,
    height: 600,

    defaults: {
        border: false,
        bodyStyle: 'background: inherit'
    },

    items: [{
        itemId: 'oms-shell',
        title: "OMS Shell",
        iconCls: 'icon-shell',
        closable: false,
        xtype: 'shell',
        url: Onc.core.Backend.url('/bin/omsh/webterm')
    }],

    initComponent: function() {
        this.callParent(arguments);
    }
});