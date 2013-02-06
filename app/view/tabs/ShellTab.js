Ext.define('Onc.view.tabs.ShellTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computeshelltab',

    layout: 'auto',
    bodyPadding: 0,
    style: 'height: auto; min-height: 40px;',
    initComponent: function () {
        this.items = [
            {
                xtype: 'shell',
                url: (this.shellConfig || {}).url

            }
        ];
        this.callParent(arguments);
    }
});

