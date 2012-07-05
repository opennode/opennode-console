Ext.define('Onc.view.compute.ComputeStateControl', {
    extend: 'Ext.container.Container',
    alias: 'widget.computestatecontrol',

    cls: 'computestatecontrol',


    initComponent: function() {
        this.addEvents('start', 'suspend', 'graceful', 'stop', 'details', 'edit');

        var buttons = [
            this._makeButton('start', "Start", "Start machine", true, {
                title: 'Starting a VM',
                text: 'Are you sure you want to boot this VM?'
            }),
            this._makeButton('suspend', "Suspend", "Suspend machine", true),
            this._makeButton('graceful', "Shut down", "Shut down machine", true, {
                title: 'Shutting down a VM',
                text: 'Are you sure? All of the processes inside a VM will be stoppped'
            }),
            this._makeButton('stop', "Force stop", "Force stop machine", true)
        ];

        // TODO: show/hide buttons according to model's properties, and remove external configurations where possible
        if (!this.disableDetails) {
            buttons[buttons.length] = this._makeButton('details', "Details", "Machine details", false);
        }
        if(!this.disableDelete) {
            buttons[buttons.length] = this._makeButton('delete', "Delete", "Delete machine", false, {
                title: 'Deleting a VM',
                text: 'Are you sure you want to delete this VM?'
            });
        }
        if (!this.disableEdit) {
            buttons[buttons.length] = this._makeButton('edit', "Edit", "Edit machine", false);
        }
        this.items = buttons;

        this.callParent(arguments);

        this._setState(this.initialState);
    },


    // Helper methods

    _makeButton: function(name, text, tooltip, hidden, confirmation) {
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
        if (this.enableText) {
            button.text = text;
        }
        var action = function() {
            this.fireEvent(name, this, this.compute);
        }.bind(this);

        if(confirmation){
            button.handler = function(){
                this._confirm(confirmation.title, confirmation.text, action);
            }.bind(this);
        }
        else
            button.handler = action;

        return button;
    },

    _confirm: function(confirmTitle, confirmText, action) {
        Ext.Msg.confirm(confirmTitle, confirmText,
            function(choice) {
                if (choice === 'yes') {
                    action();
                }
            }.bind(this)
        );
    },


    _setState: function(name) {
        if (name === 'suspended') {
            this._visible('start');
            this._visible('stop');
        } else if (name === 'stopped') {
            this._visible('start');
            this._disabled('stop');
        } else if (name === 'running') {
            this._disabled('suspend');
            this._visible('graceful');
        } else if (name === 'starting') {
            this._disabled('start');
            this._disabled('stop');
        } else if (name === 'shutting-down') {
            this._disabled('start');
            this._disabled('stop');
        } else if (name === 'suspending') {
            this._visible('start');
            this._visible('stop');
        } else if (name === 'force-stopping') {
            this._disabled('start');
            this._disabled('stop');
        }
    },

    _set: function(btnName, visible, enabled) {
        var _btns = {'start': 1, 'stop': 1, 'graceful': 1, 'suspend': 1};
        var btn = this.down('#{0}-button'.format(btnName));
        btn.setVisible(visible);
        btn.setDisabled(enabled === false);
        delete _btns[btnName];
        if (Ext.Object.getKeys(_btns).length === 2) {
            for (var name in _btns)
                _set(name, false);
            return;
        }
    },

    _visible: function(btnName) {
        this._set(btnName, true);
    },
    _disabled: function(btnName) {
        this._set(btnName, false, false);
    }
});
