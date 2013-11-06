Ext.define('Onc.view.compute.ComputeStateControl', {
	extend : 'Ext.container.Container',
	alias : 'widget.computestatecontrol',

	cls : 'computestatecontrol',

	config : {
		compute : null
	},

	computeId : null,
	enableBorders : false,
	disableHost : true,

	initComponent : function() {
		this.addEvents('start', 'graceful', 'details', 'edit', 'host');

		this.computeId = this.compute.get('id');

		this.defaults = {
			style : 'position: relative !important; float: left;'
		};
		var buttons = [this._makeButton('start', "Start", "Start machine", true, {
			title : 'Starting a VM',
			text : 'Are you sure you want to boot this VM?'
		}), this._makeButton('graceful', "Shut down", "Shut down machine", true, {
			title : 'Shutting down a VM',
			text : 'Are you sure? All of the processes inside a VM will be stoppped'
		})];

		var url = this.compute.get('url');
		// details cannot be displayed for vms that are in "hangar"
		if (!this.disableDetails && url.indexOf("/machines/hangar/") != 0) {
			buttons[buttons.length] = this._makeButton('details', "Details", "Machine details", false);
		}
		if (!this.compute.isPhysical()) {
			buttons[buttons.length] = this._makeButton('delete', "Delete", "Delete machine", false, {
				title : 'Deleting a VM',
				text : 'Are you sure you want to delete this VM?'
			});

			buttons[buttons.length] = this._makeButton('edit', "Edit", "Edit machine", false);
			buttons[buttons.length] = this._makeButton('allocate', "Allocate", "Allocate machine", true);

			if (!this.disableHost) {
				var btn = this._makeButton('host', "Host", "Go to host", false);
				var vmurl = this.compute.get('url');
				var parentId = Onc.model.Compute.extractParentId(vmurl);

				btn.listeners = {
					'afterrender' : function(el, eOpts) {
						Onc.model.Compute.getField(parentId, "hostname", function(hostname) {
							Ext.create('Onc.core.ui.widgets.StaticTip', {
								target : el.el,
								anchor : 'bottom',
								cls : 'host-tip',
								offsetY : 13,
								offsetX : -2,
								hideDelay : 2000,
								renderTo : Ext.getBody(),
								html : hostname
							});
						});
					}
				};
				buttons[buttons.length] = btn;
			}
		}
		this.items = buttons;

		this.callParent(arguments);

		this.refresh();
	},

	refresh : function() {
		this._setState();
	},

	listeners : {
		'afterrender' : function() {
			this.setCustomMask();
		}
	},
	// Helper methods

	_makeButton : function(name, text, tooltip, hidden, confirmation) {
		var button = {
			xtype : 'button',
			scale : 'large',
			itemId : '{0}-button'.format(name),
			icon : 'resources/img/icon/computestatecontrol/{0}.png'.format(name),
			iconAlign : 'top',
			tooltip : tooltip,
			hidden : hidden,
			minWidth : 38,
			border : this.enableBorders
		};
		if (this.enableText) {
			button.text = text;
		}
		var action = function() {
			this.fireEvent(name, this, this.compute);
		}.bind(this);

		if (confirmation) {
			button.handler = function() {
				this._confirm(confirmation.title, confirmation.text, action);
			}.bind(this);
		} else
			button.handler = action;

		return button;
	},

	_confirm : function(confirmTitle, confirmText, action) {
		Ext.Msg.confirm(confirmTitle, confirmText, function(choice) {
			if (choice === 'yes') {
				action();
			}
		}), this;
	},

	setCustomMask : function(text) {
		if (this.el) {
			if (this.el.isMasked())
				this.el.unmask();

			if (Ext.Array.contains(this.compute.get('features'), 'IDeploying')) {
				this.el.mask("Deploying ...", "x-mask-msg-plaintext");
			} else if (text) {
				this.el.mask(text, "x-mask-msg-plaintext");
			} else if (this.compute.get('state') === 'stopping') {
				this.el.mask('Shutting down...', "x-mask-msg-plaintext");
			} else if (this.compute.get('state') === 'starting') {
				this.el.mask('Starting...', "x-mask-msg-plaintext");
			}
			if (!this.compute.get('license_activated') && !this.compute.isPhysical()) {
				this.el.mask('Pending activation...', "x-mask-msg-plaintext");
			}

			if (!this.compute.isDeployed() && this.compute.isDeploying() &&
			     !Onc.model.AuthenticatedUser.isAdmin()) {
				this.el.mask('Allocation in progress...', "x-mask-msg-plaintext");
			} else if (!this.compute.isDeployed() && !this.compute.isDeploying()) {
                // awayting verification of the undeployed status VMs
                this.el.mask('Cleaning up...', "x-mask-msg-plaintext");
            }
		}
	},

	_setState : function(name) {

		if (!this.compute.isPhysical()) {
			this.setCustomMask();

			if (Ext.ENABLE_EDIT_VM && this.compute.isDeployed() && this.compute.isOpenVZ())
				this.down('#edit-button').setVisible(true);
			else
				this.down('#edit-button').setVisible(false);

			if (Ext.Array.contains(this.compute.get('features'), 'IUndeployed') &&
					!Ext.Array.contains(this.compute.get('features'), 'IDeploying') &&
					Onc.model.AuthenticatedUser.isAdmin())
				this.down('#allocate-button').setVisible(true);
			else
				this.down('#allocate-button').setVisible(false);
		}

		if (this.compute.get('state') === 'inactive') {
			this._visible('start');
			if (!this.compute.isPhysical())
				this.down('#delete-button').setVisible(true);
			this._disabled('graceful');
		} else if (this.compute.get('state') === 'active') {
			this._disabled('start');
			if (!this.compute.isPhysical())
				this.down('#delete-button').setVisible(false);
			this._visible('graceful');

		} else if (this.compute.get('state') === 'stopping') {
			this.setCustomMask();
		}else if (this.compute.get('state') === 'starting') {
			this.setCustomMask();
		} else {
			//Exception undefined// throw new Exception('Compute is in unknown state: ' + this.compute.get('state'));
			console.log('Compute is in unknown state: ' + this.compute.get('state'));
		}
	},

	_set : function(btnName, visible, enabled) {
		var _btns = {
			'start' : 1,
			'graceful' : 1
		};
		var btn = this.down('#{0}-button'.format(btnName));
		btn.setVisible(visible);
		btn.setDisabled(enabled === false);
		delete _btns[btnName];
		if (Ext.Object.getKeys(_btns).length === 2) {
			for (var name in _btns)_set(name, false);
			return;
		}
	},

	_visible : function(btnName) {
		// Controls are shown only for Virtual Machines
		this._set(btnName, !this.compute.isPhysical() && this.compute.isDeployed());
	},
	_disabled : function(btnName) {
		this._set(btnName, false, false);
	}
});
