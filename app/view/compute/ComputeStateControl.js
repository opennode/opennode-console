Ext.define('Onc.view.compute.ComputeStateControl', {
    extend: 'Ext.container.Container',
    alias: 'widget.computestatecontrol',

    cls: 'computestatecontrol',

    config: {
        compute: null
    },

    computeId: null,
    enableBorders: false,
    disableHost: true,

    initComponent: function() {
        this.addEvents('start', 'graceful', 'details', 'edit', 'host');

        this.computeId = this.compute.get('id');
        this.defaults = {
            style: 'position: relative !important; float: left;'
        };
        var buttons = [
            this._makeButton('start', "Start", "Start machine", true, {
                title: 'Starting a VM',
                text: 'Are you sure you want to boot this VM?'
            }),
            this._makeButton('graceful', "Shut down", "Shut down machine", true, {
                title: 'Shutting down a VM',
                text: 'Are you sure? All of the processes inside a VM will be stoppped'
            })
        ];

        if (!this.disableDetails) {
            buttons[buttons.length] = this._makeButton('details', "Details", "Machine details", false);
        }
        if(!this.compute.isPhysical()){
            buttons[buttons.length] = this._makeButton('delete', "Delete", "Delete machine", false, {
                title: 'Deleting a VM',
                text: 'Are you sure you want to delete this VM?'
            });
            buttons[buttons.length] = this._makeButton('edit', "Edit", "Edit machine", false);
            
            if(!this.disableHost){
                buttons[buttons.length] = this._makeButton('host', "Host", "Go to host", false);
            }
        }
        this.items = buttons;

        this.callParent(arguments);

        this.refresh();
    },

    refresh: function(){
        this._setState();
    },

    // Helper methods

    _makeButton: function(name, text, tooltip, hidden, confirmation) {
        var button = {
            xtype: 'button',
            scale: 'large',
            itemId: '{0}-button'.format(name),
            icon: 'img/icon/computestatecontrol/{0}.png'.format(name),
            iconAlign: 'top',
            tooltip: tooltip,
            hidden: hidden,
            minWidth: 38,
            border: this.enableBorders
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
            }
        ), this;
    },


    _setState: function(name) {
        if (this.compute.get('state') === 'inactive') {
            this._visible('start');
            this._disabled('graceful');
        } else if (this.compute.get('state') === 'active') {
            this._disabled('start');
            this._visible('graceful');
        } else {
            throw new Exception('Compute is in unknown state: ' + this.compute.get('state'));
        }
        
    },

    _set: function(btnName, visible, enabled) {
        var _btns = {'start': 1, 'graceful': 1};
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
        // Controls are shown only for Virtual Machines
        this._set(btnName, !this.compute.isPhysical());
    },
    _disabled: function(btnName) {
        this._set(btnName, false, false);
    }
});
