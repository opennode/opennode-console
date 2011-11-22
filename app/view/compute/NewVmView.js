Ext.define('Onc.view.compute.NewVmView', {
    extend: 'Ext.window.Window',
    alias: 'widget.newvm',

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

    /**
     * The parent compte whose virtualization container to create the
     * virtual machine in.
     */
    parentCompute: null,

    initComponent: function() {
        this.items = {
            xtype: 'form',
            items: [{
                xtype: 'fieldset',
                items: [// {
                //     fieldLabel: "Virtualization type",
                //     xtype: 'radiogroup',
                //     columns: 2,
                //     vertical: true,
                //     items: [
                //         {boxLabel: "OpenVZ", name: 'vtype', inputValue: 'openvz', checked: true},
                //         {boxLabel: "KVM", name: 'vtype', inputValue: 'kvm'},
                //     ]
                // },
                        {
                    fieldLabel: 'Template',
                    name: 'template',
                    xtype: 'combobox',
                    forceSelection: true,
                    store: this.parentCompute.getList('templates'),
                    displayField: 'name_and_base_type',
                    queryMode: 'local'
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
                    fieldLabel: "Number of Cores",
                    name: 'num_cores',
                    xtype: 'numberfield',
                    value: 1,
                    width: 160
                }, {
                    xtype: 'slider',
                    isFormField: false,
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
                    name: 'cpu_limit',
                    xtype: 'numberfield',
                    value: 1,
                    width: 160
                }, {
                    xtype: 'slider',
                    isFormField: false,
                    width: 100,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }, {
                    fieldLabel: "Memory/MB",
                    name: 'memory',
                    xtype: 'numberfield',
                    value: 256,
                    width: 160
                }, {
                    xtype: 'slider',
                    isFormField: false,
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
                    fieldLabel: "Disk Size/GB",
                    name: 'diskspace',
                    xtype: 'numberfield',
                    value: 10,
                    width: 160
                }, {
                    xtype: 'slider',
                    isFormField: false,
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
                    name: 'hostname',
                    xtype: 'textfield'
                }, {
                    fieldLabel: "IP Address",
                    name: 'ipv4_address',
                    xtype: 'textfield'
                }, {
                    fieldLabel: "DNS 1",
                    name: 'dns1',
                    xtype: 'textfield'
                }, {
                    fieldLabel: "DNS 2",
                    name: 'dns2',
                    xtype: 'textfield'
                }]
            }, {
                xtype: 'fieldset',
                title: "Security",
                defaults: {
                    xtype: 'textfield',
                    inputType: 'password'
                },
                items: [{
                    fieldLabel: "Root Password",
                    name: 'root_password'
                }, {
                    fieldLabel: "Root Password (repeat)",
                    name: 'root_password_repeat'
                }]
            }, {
                xtype: 'checkbox',
                name: 'start_on_boot',
                fieldLabel: "Start on boot"
            }],

            buttons: [{
                text: 'Cancel' , handler: function() {
                    this.up('window').destroy();
                }
            }, {
                text: 'Create', itemId: 'create-new-vm-button'
            }]
        };

        this.callParent(arguments);


        // this.record = Ext.create('Onc.model.Compute', {});

        // this.child('form').loadRecord(this.record);
    }
});
