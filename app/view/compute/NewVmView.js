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

    st: null,  // selected template

    adjusted: function(cName, stDefName, multiplier){
        var stdef = this.st.get(stDefName);
        var comp = Ext.getCmp(cName);

        // min max *with* multiplier
        var min = comp.minValue;
        var max = comp.maxValue;

        if(stdef === undefined || stdef === null)
            stdef = comp.value;
        else
            stdef *= multiplier === undefined || multiplier === null ? 1 : multiplier;

        stdef = Math.min(Math.max(stdef, min), max);
        comp.setValue(stdef);
    },

    setValue: function(cName, stValue){
        var value = this.st.get(stValue);
        if(value !== undefined && value !== null)
            Ext.getCmp(cName).setValue(value);
    },

    setConstraints: function(componentName, stMax, stMin, multiplier){
        var component = Ext.getCmp(componentName);

        if(multiplier === undefined)
            multiplier = 1;

        var min = this.st.get(stMin);
        var max = this.st.get(stMax);
        if(min !== undefined && min !== null)
            component.setMinValue(min * multiplier);
        if(max !== undefined && max !== null)
            component.setMaxValue(max * multiplier);
    },

    disableControls: function (boolValue){
        var controls = ['num_cores', 'num_cores_slider', 'cpu_limit', 'cpu_limit_slider', 'memory', 'memory_slider', 'diskspace', 'diskspace_slider', 'hostname', 'ipv4_address', 'dns1', 'dns2', 'root_password', 'root_password_repeat', 'start_on_boot'];

        Ext.Array.forEach(controls,function(control){
            Ext.getCmp(control).setDisabled(boolValue);
        });
    },

    listeners: {
        'afterrender': function(){
            var tooltipMap = {
                    'template': 'Choose VM template',

                    'num_cores': 'Maximum number of cores',
                    'num_cores_slider': 'Maximum number of cores',
                    'cpu_limit': 'Maximum CPU usage',
                    'cpu_limit_slider': 'Maximum CPU usage',
                    'memory': 'Maximum memory usage',
                    'memory_slider': 'Maximum memory usage',
                    'diskspace': 'Maximum disk space',
                    'diskspace_slider': 'Maximum disk space',

                    'hostname': 'Hostname',
                    'ipv4_address': 'IP v4 adress',
                    'dns1': 'Domain Name Server',
                    'dns2': 'Alternative Domain Name Server',
                    'root_password': 'OS root password',
                    'root_password_repeat': 'Repeat OS root password',

                    'start_on_boot': 'Start VM on boot'
            };
            this.disableControls(true);
            Ext.iterate(tooltipMap, function(controlName, tooltip) {
                Ext.create('Ext.tip.ToolTip', {
                    target: controlName,
                    html: tooltip
                });
            });
        }
    },

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
                    id: 'template',
                    hiddenName: 'template',  // So that valueField would be respected when POSTing
                    xtype: 'combobox',
                    emptyText: 'Choose your template',
                    forceSelection: true,
                    store: this.parentCompute.getList('templates'),
                    displayField: 'name_and_base_type',
                    valueField: 'name',
                    typeAhead: true,
                    queryMode: 'local',
                    listConfig: {
                        itemCls: 'template-picker-item'
                    },
                    listeners : {
                        'change': function(combo, records, eOpts) {
                            this.st = combo.lastSelection[0];

                            this.setConstraints('num_cores', 'cores_max', 'cores_min');
                            this.setConstraints('num_cores_slider', 'cores_max', 'cores_min');
                            this.setConstraints('cpu_limit', 'cpu_limit_max', 'cpu_limit_min', 0.01);
                            this.setConstraints('cpu_limit_slider', 'cpu_limit_max', 'cpu_limit_min');
                            this.setConstraints('memory', 'memory_max', 'memory_min', 1024);
                            this.setConstraints('memory_slider', 'memory_max', 'memory_min', 1024);
                            this.setConstraints('diskspace', 'disk_max', 'disk_min');
                            this.setConstraints('diskspace_slider', 'disk_max', 'disk_min');

                            this.adjusted('num_cores', 'cores_default');
                            this.adjusted('cpu_limit', 'cpu_limit_default', 0.01);
                            this.adjusted('memory', 'memory_default', 1024);
                            this.adjusted('diskspace', 'disk_default');

                            this.setValue('hostname', 'name');
                            this.setValue('ipv4_address', 'ip');
                            this.setValue('dns1', 'nameserver');
                            this.setValue('dns2', 'nameserver');
                            this.setValue('root_password', 'password');

                            this.disableControls(false);
                        }.bind(this)
                    }
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
                    id: 'num_cores',
                    xtype: 'numberfield',
                    value: 1,
                    width: 160
                }, {
                    xtype: 'slider',
                    id: 'num_cores_slider',
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
                    id: 'cpu_limit',
                    xtype: 'numberfield',
                    allowDecimals: true,
                    decimalPrecision: 2,
                    minValue: 0.0,
                    maxValue: 1.0,
                    step: 0.05,
                    value: 1.0,
                    width: 160
                }, {
                    xtype: 'slider',
                    id: 'cpu_limit_slider',
                    isFormField: false,
                    width: 100,
                    minValue: 5,
                    maxValue: 100,
                    increment: 5,
                    value: 100,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue / 100);
                        }
                    }
                }, {
                    fieldLabel: "Memory/MB",
                    name: 'memory',
                    id: 'memory',
                    xtype: 'numberfield',
                    value: 256,
                    width: 160
                }, {
                    xtype: 'slider',
                    id: 'memory_slider',
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
                    id: 'diskspace',
                    xtype: 'numberfield',
                    value: 10,
                    width: 160
                }, {
                    xtype: 'slider',
                    id: 'diskspace_slider',
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
                items: [// {
                //     fieldLabel: "Network Type",
                //     xtype: 'radiogroup',
                //     columns: 2,
                //     vertical: true,
                //     items: [
                //         {boxLabel: "VENET", name: 'network-type', inputValue: 'venet', checked: true},
                //         {boxLabel: "VETH", name: 'network-type', inputValue: 'veth'},
                //     ]
                // },
                        {
                    fieldLabel: "Hostname",
                    name: 'hostname',
                    id: 'hostname',
                    xtype: 'textfield'
                }, {
                    fieldLabel: "IP Address",
                    name: 'ipv4_address',
                    id: 'ipv4_address',
                    xtype: 'textfield'
                }, {
                    fieldLabel: "DNS 1",
                    name: 'dns1',
                    id: 'dns1',
                    xtype: 'textfield'
                }, {
                    fieldLabel: "DNS 2",
                    name: 'dns2',
                    id: 'dns2',
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
                    name: 'root_password',
                    id: 'root_password'
                }, {
                    fieldLabel: "Root Password (repeat)",
                    name: 'root_password_repeat',
                    id: 'root_password_repeat',
                    vtype: 'password',
                    initialPassField: 'root_password'
                }]
            }, {
                xtype: 'fieldset',
                title: "Boot parameters",
                layout: {
                    type: 'table',
                    columns: 2
                },
                items: [{
                        xtype: 'checkbox',
                        name: 'start_on_boot',
                        id: 'start_on_boot',
                        fieldLabel: "Start on boot"
                 }]
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
