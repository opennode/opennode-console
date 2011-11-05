Ext.define('opennodeconsole.tabs.ShellTab', {
    extend: 'opennodeconsole.tabs.Tab',
    alias: 'widget.computeshelltab',

    layout: 'fit',

    initComponent: function() {
        this.items = [{
            xtype: 'shell',
            url: (this.shellConfig || {}).url
        }];
        this.callParent(arguments);
    }
});
