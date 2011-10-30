Ext.define('opennodeconsole.widgets.Shell', {
    extend: 'Ext.Component',
    alias: 'widget.shell',
    cls: 'webshell',

    listeners: {
        'afterrender': function() {
            var me = this;
            setTimeout(function() {
                me.shell = new ShellInABox(BACKEND_PREFIX + 'terminal/management', me.el.dom);
                me.shell.indicateSize = true;
            }, 100);
        },
        'resize': function() {
            if (this.shell) {
                this.shell.resizer();
                this.shell.showCurrentSize();
            }
        }
    }
})