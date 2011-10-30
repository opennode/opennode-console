Ext.define('opennodeconsole.widgets.Shell', {
    extend: 'Ext.Component',
    alias: 'widget.shell',
    cls: 'webshell',

    listeners: {
        'afterrender': function() {
            var me = this;
            setTimeout(function() {
                me._shell = new ShellInABox(BACKEND_PREFIX + 'terminal/management', me.el.dom);
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