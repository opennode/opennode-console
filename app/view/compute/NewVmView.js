Ext.define('Onc.view.compute.NewVmView', {
    extend: 'Ext.window.Window',
    alias: 'widget.newvm',

    title: 'New Virtual Machine',
    title: 'Create a New Application',
    modal: true,
    border: false,
    width: 500,
    resizable: false,
    store: "TemplatesStore",

    defaults: {
        border: false,
        bodyStyle: 'background: inherit',
        bodyPadding: 4
    },

    /**
     * The parent compute where the VM will be created.
     */
    parentCompute: null,

    st: null,  // selected template
    st: null, // selected template

    adjusted: function(cName, stDefName, multiplier){
    adjusted: function(cName, stDefName, multiplier) {
        var stdef = this.st.get(stDefName);
        var comp = Ext.getCmp(cName);

        // min max *with* multiplier
        var min = comp.minValue;
        var max = comp.maxValue;

        if(stdef === -1 || stdef === undefined || stdef === null)
        if (stdef === -1 || stdef === undefined || stdef === null)
            stdef = comp.value;
        else
            stdef *= multiplier === undefined || multiplier === null ? 1 : multiplier;

        stdef = Math.min(Math.max(stdef, min), max);
        comp.setValue(stdef);
    },

    setValue: function(cName, stValue){
    setValue: function(cName, stValue) {
        var value = this.st.get(stValue);
        if(value !== -1 && value !== undefined && value !== null)
            Ext.getCmp(cName).setValue(value);
        if (value !== -1 && value !== undefined && value !== null) Ext.getCmp(cName).setValue(value);
    },

    setConstraints: function(hostProperty, componentName, stMax, stMin, multiplier, hostMultiplier, hostPropertySpec){
    setConstraints: function(hostProperty, componentName, stMax, stMin, multiplier, hostMultiplier, hostPropertySpec) {
        var component = Ext.getCmp(componentName);

        if(multiplier === undefined)
            multiplier = 1;
        if(hostMultiplier === undefined)
            hostMultiplier = 1;
        if(hostPropertySpec === undefined)
        if (multiplier === undefined) multiplier = 1;
        if (hostMultiplier === undefined) hostMultiplier = 1;
        if (hostPropertySpec === undefined)
            hostPropertySpec = '';
        else
            hostPropertySpec = '.' + hostPropertySpec;
        var parentValue = eval("this.parentCompute.get(hostProperty)" + hostPropertySpec) * hostMultiplier;

        var min = this.st.get(stMin);
        var max = this.st.get(stMax);

        if(min !== -1 && min !== undefined && min !== null)
            component.setMinValue(Math.min (min, parentValue) * multiplier);
        else
            component.setMinValue(parentValue * multiplier);
        if (this.parentCompute) {
            var parentValue = eval("this.parentCompute.get(hostProperty)" + hostPropertySpec) * hostMultiplier;

        if(max !== -1 && max !== undefined && max !== null)
            component.setMaxValue(Math.min (max, parentValue) * multiplier);
        else
            component.setMaxValue(parentValue * multiplier);
            if (min !== -1 && min !== undefined && min !== null)
                component.setMinValue(Math.min(min, parentValue) * multiplier);
            else
                component.setMinValue(parentValue * multiplier);

            if (max !== -1 && max !== undefined && max !== null)
                component.setMaxValue(Math.min(max, parentValue) * multiplier);
            else
                component.setMaxValue(parentValue * multiplier);
        } else {// If no parent comp then different rules
            var parentValue = hostMultiplier;

            if (min !== -1 && min !== undefined && min !== null)
                component.setMinValue(min * multiplier);
            else
                component.setMinValue(parentValue * multiplier);

            if (max !== -1 && max !== undefined && max !== null)
                component.setMaxValue(max * multiplier);
            else
                component.setMaxValue(parentValue * multiplier);
        }

    },

    disableControls: function (boolValue){
        var controls = ['num_cores', 'num_cores_slider', 'cpu_limit', 'cpu_limit_slider', 'memory', 'memory_slider', 'diskspace', 'diskspace_slider', 'hostname', 'ipv4_address', 'dns1', 'dns2', 'root_password', 'root_password_repeat', 'start_on_boot', 'newvm_tagger'];
    disableControls: function(boolValue) {
        var controls = ['num_cores', 'swap', 'memory', 'diskspace', 'hostname', 'ipv4_address', 'nameservers', 'root_password', 'root_password_repeat', 'start_on_boot', 'start_vm'];

        Ext.Array.forEach(controls,function(control){
        Ext.Array.forEach(controls, function(control) {
            Ext.getCmp(control).setDisabled(boolValue);
        });
    },

    listeners: {
        'afterrender': function(){

        'afterrender': function() {
            var tooltipMap = {
                    'template': 'Choose VM template',
                'template': 'Choose VM template',

                    'num_cores': 'Number of cores',
                    'num_cores_slider': 'Number of cores',
                    'cpu_limit': 'CPU usage limit',
                    'cpu_limit_slider': 'CPU usage limit',
                    'memory': 'Assigned RAM',
                    'memory_slider': 'Assigned RAM',
                    'diskspace': 'Assigned disk space',
                    'diskspace_slider': 'Assigned disk space',
                'num_cores': 'Number of cores',
                'cpu_limit': 'CPU usage limit',
                'memory': 'Assigned RAM',
                'swap': 'Assigned swap memory',
                'diskspace': 'Assigned disk space',

                    'hostname': 'Hostname',
                    'ipv4_address': 'IPv4 address',
                    'dns1': 'Main Domain Name Server',
                    'dns2': 'Alternative Domain Name Server',
                    'root_password': 'Root password',
                    'root_password_repeat': 'Repeat root password',
                'hostname': 'Hostname',
                'ipv4_address': 'IPv4 address',
                'nameservers': 'Domain Name Servers, comma seperated list',
                'root_password': 'Root password',
                'root_password_repeat': 'Repeat root password',

                    'start_on_boot': 'Start VM on boot'
                'start_on_boot': 'Start VM on boot',
                'start_vm': 'Start VM'
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

        var templatesStore = (this.parentCompute != null) ? this.parentCompute.getList('templates') : this.store;

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
            items: [
                    {
                        xtype: 'fieldset',
                        title: "1.Pick a template",
                        style: {
                            paddingBottom: 0,
                            paddingLeft: 0,
                            paddingRight: 0
                        },
                        frame: true,
                        overflowX: 'auto',
                        items: [
                                {
                                    xtype: 'textfield',
                                    id: "template",
                                    name: "template",
                                    hidden: true
                                },
                                {
                                    id: "templatesIcons",
                                    name: "templatesIcons",
                                    xtype: "dataview",
                                    height: 75,
                                    overItemCls: 'template-over',
                                    selectedItemCls: 'template-selected',
                                    trackOver: true,
                                    store: templatesStore,
                                    tpl: ['<table><tbody><tr><tpl for=".">', '<td><div class="template-icon-wrap" data-qtip="{name_and_base_type}">', '<span>{name_short}</span>',
                                            '<img src="img/appicons/{name_short}.png" width="65" height="65" onerror="this.style.display =\'none\'"/>', '</div></td>', '</tpl></tbody></table>', ''],
                                    itemSelector: 'div.template-icon-wrap',
                                    emptyText: 'No templates available',
                                    listeners: {
                                        selectionchange: function(combo, records, eOpts) {
                                            if (records[0]) {
                                                this.st = records[0];

                            this.setConstraints('num_cores', 'num_cores', 'cores_max', 'cores_min');
                            this.setConstraints('num_cores', 'num_cores_slider', 'cores_max', 'cores_min');
                            this.setConstraints('num_cores', 'cpu_limit', 'cpu_limit_max', 'cpu_limit_min', 0.01, 100);
                            this.setConstraints('num_cores', 'cpu_limit_slider', 'cpu_limit_max', 'cpu_limit_min', 1, 100);
                            this.setConstraints('memory', 'memory', 'memory_max', 'memory_min', 1024);
                            this.setConstraints('memory', 'memory_slider', 'memory_max', 'memory_min', 1024);
                            this.setConstraints('diskspace', 'diskspace', 'disk_max', 'disk_min', 1, 1, 'total');
                            this.setConstraints('diskspace', 'diskspace_slider', 'disk_max', 'disk_min', 1, 1/1024, 'total');
                                                this.setConstraints('num_cores', 'num_cores', 'cores_max', 'cores_min');
                                                this.setConstraints('memory', 'memory', 'memory_max', 'memory_min', 1024);
                                                this.setConstraints('swap', 'swap', 'swap_max', 'swap_min', 1024);
                                                this.setConstraints('diskspace', 'diskspace', 'disk_max', 'disk_min', 1, 1, 'total');

//                            this.adjusted('num_cores', 'cores_default');
                            this.adjusted('cpu_limit', 'cpu_limit_default', 0.01);
                            this.adjusted('cpu_limit_slider', 'cpu_limit_default');
                            this.adjusted('memory', 'memory_default', 1024);
                            this.adjusted('memory_slider', 'memory_default', 1024);
                            this.adjusted('diskspace', 'disk_default');
                            this.adjusted('diskspace_slider', 'disk_default');
                                                this.adjusted('memory', 'memory_default', 1024);
                                                this.adjusted('diskspace', 'disk_default');

                            this.setValue('hostname', 'name');
                            this.setValue('ipv4_address', 'ip');
                            this.setValue('dns1', 'nameserver');
                            this.setValue('dns2', 'nameserver');
                            this.setValue('root_password', 'password');
                                                this.setValue('hostname', 'name');
                                                this.setValue('ipv4_address', 'ip');
                                                this.setValue('nameservers', 'nameserver');
                                                this.setValue('root_password', 'password');
                                                this.setValue('template', 'name');

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
                                                this.disableControls(false);
                                                Ext.getCmp('submitButton').enable();
                                            } else {
                                                this.st = null;
                                                this.disableControls(true);
                                                Ext.getCmp('submitButton').disable();
                                            }
                                        }.bind(this)
                                    }
                                }]
                    }, {
                        xtype: 'fieldset',
                        title: "2.Define VM Resources",
                        frame: true,
                        layout: {
                            type: 'vbox',
                            pack: 'start',
                            align: 'stretch'
                        },
                        'changecomplete': function(ev, newValue) {
                            newValue *= 100;
                            cpuLimitSlider = Ext.getCmp('cpu_limit_slider');
                            cpuLimit = Ext.getCmp('cpu_limit');
                            cpuLimitSlider.setMaxValue(newValue);
                            cpuLimit.setMaxValue(newValue/100);
                            if (newValue < (cpuLimit.value*100)){
                                cpuLimitSlider.setValue(newValue);
                                cpuLimit.setValue(newValue/100);
                        items: [{
                            id: 'vm_profile',
                            name: 'vm_profile',
                            fieldLabel: 'VM Profile',
                            xtype: 'combo',
                            mode: 'local',
                            value: 'default',
                            triggerAction: 'all',
                            forceSelection: true,
                            editable: false,
                            displayField: 'name',
                            valueField: 'value',
                            queryMode: 'local',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['name', 'value'],
                                data: [{
                                    name: 'Large mem VM profile name',
                                    value: 'default'
                                }, {
                                    name: 'Medium mem VM profile name',
                                    value: 'medium'
                                }, {
                                    name: 'small mem VM profile name',
                                    value: 'small'
                                }]
                            })
                        }, {
                            id: 'allocation_policy',
                            name: 'allocation_policy',
                            fieldLabel: 'Allocation policy',
                            xtype: 'combo',
                            mode: 'local',
                            value: 'automatic',
                            triggerAction: 'all',
                            forceSelection: true,
                            editable: false,
                            displayField: 'hostname',
                            valueField: 'id',
                            queryMode: 'local',
                            store: Ext.getStore("AllocationPolicyStore"),
                            listeners: {
                                change: function(combo, newValue, oldValue, eOpts) {
                                    var templatesIcons = Ext.getCmp('templatesIcons');
                                    templatesIcons.disable();
                                    templatesIcons.deselect(this.st);
                                    combo.disable();
                                    if (newValue !== "automatic") {
                                        var computeId = newValue;
                                        var comp = Ext.getStore('AllocationPolicyStore').getById(computeId);
                                        comp.updateSubset('templates', function(templatesStore) {
                                            templatesIcons.store = templatesStore;
                                            templatesIcons.refresh();
                                            templatesIcons.enable();
                                            combo.enable();
                                        }, function(error) {
                                            console.error('Error while loading data: ', error);
                                            return;
                                        });
                                    } else {
                                        templatesIcons.store = Ext.getStore('TemplatesStore');
                                        templatesIcons.refresh();
                                        templatesIcons.enable();
                                        combo.enable();
                                    }
                                }.bind(this)
                            }
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
                    allowDecimals: true,
                    decimalPrecision: 2,
                    step: 0.5,
                    value: 10,
                    width: 160
                }, {
                    xtype: 'slider',
                    id: 'diskspace_slider',
                    allowDecimals: true,
                    decimalPrecision: 2,
                    increment: 0.5,
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
            }, {
                xtype: 'fieldset',
                title: "Tags",
                id: "tags",
                padding: 5,
                items: [{
                        id: 'newvm_tagger',
                        xtype: 'tagger',
                        suggestions:  ['label:Infrastructure', 'label:Staging', 'label:Development', 'label:Production'],
                        tags: ['label:Development'],
                        prefix: 'label:'
                 }]
            }],

                        }, {
                            xtype: 'container',
                            layout: {
                                type: 'table',
                                columns: 2
                            },
                            items: [{
                                fieldLabel: "Memory",
                                name: 'memory',
                                id: 'memory',
                                xtype: 'numberfield',
                                value: 256,
                                step: 128,
                                minValue: 128,
                                maxValue: 10240,
                                width: 160,
                                style: {
                                    marginRight: '10px'
                                }
                            }, {
                                fieldLabel: "Swap",
                                name: 'swap',
                                id: 'swap',
                                xtype: 'numberfield',
                                value: 256,
                                step: 128,
                                minValue: 128,
                                maxValue: 10240,
                                width: 160
                            }, {
                                fieldLabel: "CPUs",
                                name: 'num_cores',
                                id: 'num_cores',
                                xtype: 'numberfield',
                                value: 1,
                                minValue: 1,
                                maxValue: 10,
                                width: 160
                            }, {
                                fieldLabel: "Disk",
                                name: 'diskspace',
                                id: 'diskspace',
                                xtype: 'numberfield',
                                allowDecimals: true,
                                decimalPrecision: 2,
                                step: 0.5,
                                minValue: 2,
                                maxValue: 1000,
                                value: 10,
                                width: 160
                            }]
                        }, {
                            id: 'storage_location',
                            name: 'storage_location',
                            fieldLabel: 'Storage location',
                            xtype: 'combo',
                            mode: 'local',
                            value: 'default',
                            triggerAction: 'all',
                            forceSelection: true,
                            editable: false,
                            readOnly: true,
                            displayField: 'name',
                            valueField: 'value',
                            queryMode: 'local',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['name', 'value'],
                                data: [{
                                    name: 'Default',
                                    value: 'default'
                                }]
                            })
                        }]

                    }, {
                        xtype: 'fieldset',
                        title: "3.Set network parameters",
                        layout: {
                            type: 'table',
                            columns: 2
                        },
                        items: [{
                            fieldLabel: "Hostname",
                            name: 'hostname',
                            id: 'hostname',
                            xtype: 'textfield',
                            style: {
                                marginRight: '10px'
                            },
                            labelWidth: 70,
                            width: 280,
                        }, {
                            fieldLabel: "IP Address",
                            name: 'ipv4_address',
                            id: 'ipv4_address',
                            xtype: 'textfield',
                            labelWidth: 70
                        }, {
                            fieldLabel: "Nameservers",
                            name: 'nameservers',
                            id: 'nameservers',
                            colspan: 2,
                            width: 460,
                            xtype: 'textfield',
                            labelWidth: 70
                        }]
                    }, {
                        xtype: 'fieldset',
                        title: "4.Set credentials",
                        layout: {
                            type: 'vbox',
                            pack: 'start',
                            align: 'stretch'
                        },
                        items: [{
                            flex: 1,
                            fieldLabel: "Root Password",
                            name: 'root_password',
                            id: 'root_password',
                            xtype: 'textfield',
                            inputType: 'password',
                            labelWidth: 120
                        }, {
                            flex: 2,
                            fieldLabel: "Root Password (x2)",
                            name: 'root_password_repeat',
                            id: 'root_password_repeat',
                            xtype: 'textfield',
                            inputType: 'password',
                            vtype: 'password',
                            initialPassField: 'root_password',
                            labelWidth: 120
                        }, {
                            xtype: 'container',
                            layout: {
                                type: 'hbox'
                            },
                            items: [{
                                flex: 1,
                                xtype: 'checkbox',
                                name: 'start_vm',
                                id: 'start_vm',
                                fieldLabel: "Start VM"
                            }, {
                                flex: 2,
                                xtype: 'checkbox',
                                name: 'start_on_boot',
                                id: 'start_on_boot',
                                fieldLabel: "Start on boot"
                            }]
                        }]
                    }],

            buttons: [{
                text: 'Cancel' , handler: function() {

                text: 'Cancel',
                handler: function() {
                    this.up('window').destroy();
                }
            }, {
                text: 'Create', itemId: 'create-new-vm-button'
                id: 'submitButton',
                disabled: true,
                text: 'Create',
                itemId: 'create-new-vm-button'
            }]
        };

        this.callParent(arguments);


        // this.record = Ext.create('Onc.model.Compute', {});

        // this.child('form').loadRecord(this.record);

        // this.record = Ext.create('Onc.model.Compute', {});

        // this.child('form').loadRecord(this.record);
    }
});
