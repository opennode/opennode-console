Ext.define('Onc.view.tabs.ShellTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computeshelltab',

    layout: 'fit',
    bodyPadding: 0,

    initComponent: function() {
        this.items = [{
            xtype: 'shell',
            url: (this.shellConfig || {}).url
        }];
        this.callParent(arguments);
    }
});
