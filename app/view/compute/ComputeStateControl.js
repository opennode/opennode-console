Ext.define('Onc.view.compute.ComputeStateControl', {
    extend: 'Ext.container.Container',
    alias: 'widget.computestatecontrol',

    cls: 'computestatecontrol',

    initComponent: function() {
        var me = this;

        this.addEvents('start', 'suspend', 'graceful', 'stop', 'details');

        function makeButton(name, text, tooltip, hidden, transientState, finalState) {
            var button = {
                xtype: 'button',
                scale: 'large',
                itemId: '{0}-button'.format(name),
                scale: 'large',
                icon: 'img/icon/computestatecontrol/{0}.png'.format(name),
                iconAlign: 'top',
                tooltip: tooltip,
                hidden: hidden
            };
            if (me.enableText) {
                button.text = text;
            }
            if (transientState) {
                button.handler = function() {
                    //XXX: setting transient states screws up precheck logic i
                    //me._setState(transientState);
                    me.fireEvent(name, me, function() { me._setState(finalState); });
                }
            } else {
                button.handler = function() {
                    me.fireEvent(name, me, false);
                }
            }
            return button;
        }

        var buttons = [
            makeButton('start', "Start", "Start machine", true, 'starting', 'running'),
            makeButton('suspend', "Suspend", "Suspend machine", true, 'suspending', 'suspended'),
            makeButton('graceful', "Shut down", "Shut down machine", true, 'shutting-down', 'stopped'),
            makeButton('stop', "Force stop", "Force stop machine", true, 'force-stopping', 'stopped')
        ];
        if (!this.disableDetails) {
            buttons[buttons.length] = makeButton('details', "Details", "Machine details", false);
        }
        if(!this.disableDelete) {
            buttons[buttons.length] = makeButton('delete', "Delete", "Delete machine", false);
        }
        buttons[buttons.length] = makeButton('edit', "Edit", "Edit machine", false);
        this.items = buttons;

        this.callParent(arguments);

        me._setState(me.initialState);
    },

    _setState: function(name) {
        var me = this;

        var _btns = {'start': 1, 'stop': 1, 'graceful': 1, 'suspend': 1};
        function _set(btnName, visible, enabled) {
            var btn = me.down('#{0}-button'.format(btnName));
            btn.setVisible(visible);
            btn.setDisabled(enabled === false);
            delete _btns[btnName];
            if (Ext.Object.getKeys(_btns).length === 2) {
                for (var name in _btns)
                    _set(name, false);
                return;
            }
        }
        function visible(btnName) { _set(btnName, true); }
        function disabled(btnName) { _set(btnName, false, false); }

        if (name === 'suspended') {
            visible('start');
            visible('stop');
        } else if (name === 'stopped') {
            visible('start');
            disabled('stop');
        } else if (name === 'running') {
            disabled('suspend');
            visible('graceful');
        } else if (name === 'starting') {
            disabled('start');
            disabled('stop');
        } else if (name === 'shutting-down') {
            disabled('start');
            disabled('stop');
        } else if (name === 'suspending') {
            visible('start');
            visible('stop');
        } else if (name === 'force-stopping') {
            disabled('start');
            disabled('stop');
        }
    }
});
