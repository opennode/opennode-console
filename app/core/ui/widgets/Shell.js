Ext.define('Onc.core.ui.widgets.Shell', {
    extend: 'Ext.Component',
    alias: 'widget.shell',
    cls: 'webshell',

    initComponent: function() {
        if (typeof this.url === 'undefined')
            throw new Error("URL not specified");
        this.callParent();
    },

    listeners: {
        'afterrender': function() {
            var me = this;
            setTimeout(function() {
                me._shell = new ShellInABox(me.url, me.el.dom);
                me._shell.indicateSize = true;
            }, 100);
        },
        'resize': function() {
            if (this._shell) {
                this._shell.resizer();
                this._shell.showCurrentSize();
            }
        },
        'activate': function() {
            if (this._shell)
                this._shell.focusCursor();
        }
    }
})