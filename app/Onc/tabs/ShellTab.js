Ext.define('Onc.tabs.ShellTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computeshelltab',

    layout: 'fit',
    padding: 10,
    bodyPadding: 0,

    initComponent: function() {
        this.items = [{
            xtype: 'shell',
            url: (this.shellConfig || {}).url
        }];
        this.callParent(arguments);
    }
});
