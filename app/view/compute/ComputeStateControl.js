Ext.define('Onc.view.compute.ComputeStateControl', {
    extend: 'Ext.container.Container',
    alias: 'widget.computestatecontrol',

    cls: 'computestatecontrol',

    initComponent: function() {
        var me = this;

        this.addEvents('start', 'suspend', 'graceful', 'stop', 'details');

        function makeButton(name, transientState, finalState) {
            return {
                name: name,
                attrs: {
                    hidden: true,
                    handler: me._makeTransform(name, transientState, finalState)
                }
            };
        }

        var buttons = [
            makeButton('start', 'starting', 'running'),
            makeButton('suspend', 'suspending', 'suspended'),
            makeButton('graceful', 'shutting-down', 'stopped'),
            makeButton('stop', 'force-stopping', 'stopped'),
        ];

        if (!me.disableDetails) {
            buttons[buttons.length] = {
                name: 'details',
                attrs: {
                    hidden: false,
                    handler: function() {me.fireEvent('details', me, false)}
                }
            }
        }

        var tooltips = {
            'start' : 'Start machine',
            'suspend' : 'Suspend machine',
            'graceful' : 'Shut down machine',
            'stop' : 'Force stop machine',
            'details' : 'Machine details'
        };
        var texts = {
            'start' : 'Start',
            'suspend' : 'Suspend',
            'graceful' : 'Shut down',
            'stop' : 'Force stop',
            'details' : 'Details'
        };

        this.items = buttons.map(function(i) {
            if (me.enableText) {
                i.attrs.text = texts[i.name];
            }
            return Ext.apply({
                xtype: 'button',
                itemId: '{0}-button'.format(i.name),
                scale: 'large',
                icon: 'img/icon/computestatecontrol/{0}.png'.format(i.name),
                iconAlign: 'top',
                tooltip: tooltips[i.name]
            }, i.attrs);
        });
        this.callParent(arguments);

        me._setState(me.initialState);
    },

    _makeTransform: function(eventName, transientState, finalState) {
        var me = this;
        return function() {
            //XXX: setting transient states screws up precheck logic i
            //me._setState(transientState);
            me.fireEvent(eventName, me, function() { me._setState(finalState); });
        };
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
