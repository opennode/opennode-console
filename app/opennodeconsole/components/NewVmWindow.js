Ext.define('opennodeconsole.components.NewVmWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.newvmwindow',

    title: 'New Virtual Machine',
    modal: true,
    border: false,
    width: 300,
    resizable: false,

    defaults: {
        border: false,
        bodyStyle: 'background: inherit',
        bodyPadding: 4
    },

    initComponent: function() {
        this.items = {
            xtype: 'form',
            items: [{
                xtype: 'fieldset',
                items: [{
                    fieldLabel: "Virtualization type",
                    xtype: 'radiogroup',
                    columns: 2,
                    vertical: true,
                    items: [
                        {boxLabel: "OpenVZ", name: 'vtype', inputValue: 'openvz', checked: true},
                        {boxLabel: "KVM", name: 'vtype', inputValue: 'kvm'},
                    ]
                }, {
                    fieldLabel: 'Template',
                    name: 'template',
                    xtype: 'combobox',
                    forceSelection: true,
                    store: 'Templates',
                    displayField: 'name'
                }]
            }, {
                xtype: 'fieldset',
                title: "Hardware parameters",
                frame: true,
                layout: {
                    type: 'table',
                    columns: 2
                },
                items: [{
                    fieldLabel: "Memory/MB",
                    xtype: 'textfield',
                    value: '256',
                    width: 160
                }, {
                    xtype: 'slider',
                    width: 100,
                    minValue: 128,
                    maxValue: 10240,
                    increment: 32,
                    value: 256,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }, {
                    fieldLabel: "Nr. of CPUs",
                    xtype: 'textfield',
                    value: '1',
                    width: 160
                }, {
                    xtype: 'slider',
                    width: 100,
                    minValue: 1,
                    maxValue: 10,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }, {
                    fieldLabel: "CPU Limit",
                    xtype: 'textfield',
                    value: '1',
                    width: 160
                }, {
                    xtype: 'slider',
                    width: 100,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }, {
                    fieldLabel: "Disk Size/GB",
                    xtype: 'textfield',
                    value: '10',
                    width: 160
                }, {
                    xtype: 'slider',
                    width: 100,
                    minValue: 2,
                    maxValue: 1000,
                    value: 10,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }]
            }, {
                xtype: 'fieldset',
                title: "Network",
                items: [{
                    fieldLabel: "Network Type",
                    xtype: 'radiogroup',
                    columns: 2,
                    vertical: true,
                    items: [
                        {boxLabel: "VENET", name: 'network-type', inputValue: 'venet', checked: true},
                        {boxLabel: "VETH", name: 'network-type', inputValue: 'veth'},
                    ]
                }, {
                    fieldLabel: "Hostname",
                    xtype: 'textfield'
                }, {
                    fieldLabel: "IP Address",
                    xtype: 'textfield'
                }, {
                    fieldLabel: "DNS 1",
                    xtype: 'textfield'
                }, {
                    fieldLabel: "DNS 2",
                    xtype: 'textfield'
                }]
            }, {
                xtype: 'fieldset',
                title: "Security",
                items: [{
                    fieldLabel: "Root Password",
                    xtype: 'textfield'
                }, {
                    fieldLabel: "Root Password (repeat)",
                    xtype: 'textfield'
                }]
            }, {
                xtype: 'checkbox',
                fieldLabel: "Start on boot"
            }]
        };

        this.callParent(arguments);
    },

    dockedItems: {
        dock: 'bottom',
        frame: true,

        layout: {
            type: 'hbox',
            pack: 'end'
        },

        defaults: {
            xtype: 'button',
            margin: 2
        },

        items: [{
            text: 'Cancel'
        }, {
            text: 'Create'
        }]
    }
});
