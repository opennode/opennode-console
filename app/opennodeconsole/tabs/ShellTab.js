Ext.define('opennodeconsole.tabs.ShellTab', {
    extend: 'opennodeconsole.tabs.Tab',
    alias: 'widget.computeshelltab',

    layout: 'fit',

    initComponent: function() {
        console.debug('ShellTab.initComponent');
        this.items = [{
            xtype: 'shell',
            url: this.shellConfig.url,

            listeners: {'afterrender': function() { console.debug('shell.on:afterrender'); }}
        }];
        this.callParent(arguments);
    },

    listeners: {
        'afterrender': function() {
            console.debug('ShellTab.on:afterrender')
        }
    }
});
