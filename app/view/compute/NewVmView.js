Ext.define('Onc.view.compute.NewVmView', {
    extend : 'Ext.window.Window',
    alias : 'widget.newvm',

    title : 'Create a New Application',
    modal : true,
    border : false,
    width : 500,
    resizable : false,

    defaults : {
        border : false,
        bodyStyle : 'background: inherit',
        bodyPadding : 4
    },

    /**
     * The parent compute where the VM will be created.
     */
    parentCompute : null,

    /**
     * Temp field. Keeps form fields that are hidden based on base_type, so we can unhide them.
     */
    tempHiddenFields : [],

    /*
     * Tooltips that are loaded once.
     */
    tooltipMapStatic : {
        'template' : 'Choose VM template',
        'num_cores' : 'Number of cores',
        'cpu_limit' : 'CPU usage limit',
        'memory' : 'Assigned RAM',
        'swap_size' : 'Assigned swap memory',
        'diskspace' : 'Assigned disk space',
        'ipv4_address' : 'IPv4 address: Server does automatic allocation if IP is empty ',
        'nameservers' : 'Domain Name Servers, comma seperated list',
        'root_password' : 'Root password',
        'root_password_repeat' : 'Repeat root password',
        'start_on_boot' : 'Start VM on boot',
        'start_vm' : 'Start VM'
    },
    /*
     * Tooltips that are changing based on template.base_type property value
     * Default tooltips, when no BaseType is found in tooltipMapBaseType
     */
    tooltipMapDefaults : {
        'hostname' : 'Hostname',
    },
    tooltipMapBaseType : {
        'kvm' : {
            'hostname' : 'VM label'
        }
    },
    /*
     * Labels that are changing based on template.base_type property value
     */
    labelsMapDefaults : {
        'hostname' : 'Hostname',
    },
    labelsMapBaseType : {
        'kvm' : {
            'hostname' : 'VM label'
        }
    },

    st : null, // selected template

    vmProfile : null, //selected VM profile

    adjusted : function(cName, stDefName, multiplier) {
        var stdef = this.st.get(stDefName);
        var comp = Ext.getCmp(cName);

        // min max *with* multiplier
        var min = comp.minValue;
        var max = comp.maxValue;

        if (stdef === -1 || stdef === undefined || stdef === null)
            stdef = comp.value;
        else
            stdef *= multiplier === undefined || multiplier === null ? 1 : multiplier;

        stdef = Math.min(Math.max(stdef, min), max);
        comp.setValue(stdef);
    },

    setValue : function(cName, stValue) {
        var value = this.st.get(stValue);
        if (value !== -1 && value !== undefined && value !== null)
            Ext.getCmp(cName).setValue(value);
    },

    unitProperty : {
        'memory' : 'GB',
        'diskspace' : 'GB',
        'swap_size' : 'GB',
        'num_cores' : ''
    },
    setConstraints : function(hostProperty, componentName, stMax, stMin, multiplier, hostMultiplier, hostPropertySpec) {
        var component = Ext.getCmp(componentName);
        if (multiplier === undefined)
            multiplier = 1;
        if (hostMultiplier === undefined)
            hostMultiplier = 1;
        if (hostPropertySpec === undefined)
            hostPropertySpec = '';
        else
            hostPropertySpec = '.' + hostPropertySpec;

        var min = this.st.get(stMin);
        var max = this.st.get(stMax);

        if (this.parentCompute) {
            var parentValue = eval("this.parentCompute.get(hostProperty)" + hostPropertySpec) * hostMultiplier;

            if (min !== -1 && min !== undefined && min !== null)
                min = Math.min(min, parentValue) * multiplier;
            else
                min = parentValue * multiplier;

            if (max !== -1 && max !== undefined && max !== null)
                max = Math.min(max, parentValue) * multiplier;
            else
                max = parentValue * multiplier;
        } else {// If no parent comp then different rules
            var parentValue = hostMultiplier;

            if (min !== -1 && min !== undefined && min !== null)
                min = min * multiplier;
            else
                min = parentValue * multiplier;

            if (max !== -1 && max !== undefined && max !== null)
                max = max * multiplier;
            else
                max = -1;
        }
        var cPlaces = 10;
        min = Math.ceil(min * cPlaces) / cPlaces;
        max = Math.floor(max * cPlaces) / cPlaces;
        component.setMinValue(min);
        if (max !== -1)
            component.setMaxValue(max);

        // label formatting
        var oldLabel = component.labelEl.getHTML();
        var limitsIdx = oldLabel.indexOf("(");
        if (limitsIdx > 0)
            oldLabel = oldLabel.substr(0, limitsIdx);
        var limitsPart = " ({0} .. {1} {2})".format(min, (max !== -1) ? max : '', this.unitProperty[componentName]);
        component.labelEl.update(oldLabel + limitsPart);
    },

    baseTypeChanges : function(baseType) {
        this.loadTooltips(baseType);
        Ext.iterate(this.tempHiddenFields, function(control, visible) {
            if (!visible)
                Ext.getCmp(control).show();
            else
                Ext.getCmp(control).hide();
        });
        switch (baseType) {
            case "kvm":

                var fieldsVisibility = {
                    'swap_size' : false,
                    'credentialsFieldset' : false,
                    'credentialsFieldsetKvm' : true
                };
                Ext.iterate(fieldsVisibility, function(control, visible) {
                    if (visible)
                        Ext.getCmp(control).show();
                    else
                        Ext.getCmp(control).hide();
                });
                this.tempHiddenFields = fieldsVisibility;

                break;
        }

        var labelsMap = (baseType == "openvz" || this.labelsMapBaseType[baseType] === undefined) ? this.labelsMapDefaults : this.labelsMapBaseType[baseType];

        Ext.iterate(labelsMap, function(controlName, label) {
            Ext.getCmp(controlName).setFieldLabel(label);
        });
    },

    disableControls : function(boolValue) {
        var controls = ['vm_profile', 'storage_location', 'num_cores', 'swap_size', 'memory', 'diskspace','hostname', 'ipv4_address', 'nameservers', 'root_password', 'root_password_repeat', 'start_on_boot', 'start_vm', 'ipv4_mask'];

        Ext.Array.forEach(controls, function(control) {
            Ext.getCmp(control).setDisabled(boolValue);
        });
    },

    loadTooltips : function(baseType) {
        var tooltipMap = {};
        Ext.Object.merge(tooltipMap, this.tooltipMapDefaults);

        if (!baseType)
            Ext.Object.merge(tooltipMap, this.tooltipMapStatic);

        if (this.tooltipMapBaseType[baseType] !== undefined)
            Ext.Object.merge(tooltipMap, this.tooltipMapBaseType[baseType]);

        Ext.iterate(tooltipMap, function(controlName, tooltip) {
            var toolTipName = controlName + "Tip";
            var oldToolTip = Ext.ComponentQuery.query('tooltip[itemId=' + toolTipName + ']');
            if (oldToolTip[0])
                oldToolTip[0].destroy();
            Ext.create('Ext.tip.ToolTip', {
                itemId : toolTipName,
                target : controlName,
                html : tooltip
            });
        });
    },

    loadTemplates : function(store) {
        var templatesIcons = Ext.getCmp('templatesIcons');
        var combo = Ext.getCmp('allocation_policy');
        if (store) {// enable
            templatesIcons.bindStore(store);
            // templatesIcons.enable();
            combo.enable();
            if (this.st) {
                var newStIndex = store.findBy( function(record, id) {
                    if (record.get('name_and_base_type') == this.st.get("name_and_base_type") || record.get('name') == this.st.get("name") || record.get('name_short') == this.st.get("name_short")) {
                        return true;
                    }
                }.bind(this));
                if (newStIndex != -1) {
                    templatesIcons.select(store.getAt(newStIndex));
                }
            }
        } else {// disable
            // templatesIcons.disable();
            templatesIcons.deselect(this.st);
            combo.disable();
        }
    },

    listeners : {
        'afterrender' : function() {

            this.disableControls(true);

            this.loadTooltips();
            // Hiding "users" fields, shown if "admin"
            var isAdmin = Onc.model.AuthenticatedUser.isAdmin();
            var onlyAdminFields = ['allocation_policy', 'storage_location', 'ipv4_address', 'nameservers', 'start_vm', 'start_on_boot'];
            if (!isAdmin) {
                for (var i = 0; i < onlyAdminFields.length; i++) {
                    var field = Ext.getCmp(onlyAdminFields[i]);
                    field.disable();
                    // for validation
                    field.isFormField = false;
                    // not POST-ing it
                    field.hide();
                }
            }
        }
    },

    initComponent : function() {

        //So window open fresh data is loaded afterwards
        Ext.getStore('TemplatesStore').removeAll();

        this.items = {
            xtype : 'form',
            items : [{
                xtype : 'fieldset',
                title : "1.Pick a template",
                style : {
                    paddingBottom : 0,
                    paddingLeft : 0,
                    paddingRight : 0
                },
                frame : true,
                overflowX : 'auto',
                items : [{
                    xtype : 'textfield',
                    id : "backend",
                    name : "backend",
                    hidden : true
                }, {
                    xtype : 'textfield',
                    id : "template",
                    name : "template",
                    hidden : true
                }, {
                    id : "templatesIcons",
                    name : "templatesIcons",
                    xtype : "dataview",
                    minHeight : 100,
                    overItemCls : 'template-over',
                    selectedItemCls : 'template-selected',
                    trackOver : true,
                    tpl : ['<table><tbody><tr><tpl for=".">', 
                    		'<td>', 
                    		'<div class="template-wrap"><div class="base_type">{base_type}</div>',
                    		'<div class="template-icon-wrap" data-qtip="{tooltip_name}">',
                    		'<span>{name_short}</span>',
                    		'<img src="resources/img/appicons/{name_short}.png" width="65" height="65" onerror="this.style.display =\'none\'"/>',
                    		'</div></div><div class="template_name">{display_name}</div></td>',
                    		'</tpl></tbody></table>', ''],
                    itemSelector : 'div.template-icon-wrap',
                    emptyText : 'No templates available',
                    listeners : {
                        selectionchange : function(combo, records, eOpts) {
                            if (records[0]) {
                                this.st = records[0];

                                this.setConstraints('num_cores', 'num_cores', 'cores_max', 'cores_min');
                                this.setConstraints('memory', 'memory', 'memory_max', 'memory_min', 1, 1 / 1024);
                                this.setConstraints('swap_size', 'swap_size', 'swap_max', 'swap_min', 1, 1 / 1024);
                                this.setConstraints('diskspace', 'diskspace', 'disk_max', 'disk_min', 1, 1 / 1024, 'total');

                                this.setValue('backend', 'base_type');
                                this.setValue('ipv4_address', 'ip');
                                this.setValue('nameservers', 'nameserver');
                                // XXX Ilja: not sure if it should be set or not
                                //this.setValue('root_password', 'password');
                                //this.setValue('root_password_repeat', 'password');
                                this.setValue('template', 'name');
                                Ext.getCmp('templatePassword').setText(this.st.get('password'));
                                Ext.getCmp('templateUsername').setText(this.st.get('username'));

                                this.disableControls(false);
                                this.baseTypeChanges(this.st.get("base_type"));
                                Ext.getCmp('submitButton').enable();
                            } else {
                                this.disableControls(true);
                                Ext.getCmp('submitButton').disable();
                            }
                        }.bind(this)
                    }
                }]
            }, {
                xtype : 'fieldset',
                title : "2.Define VM Resources",
                frame : true,
                layout : {
                    type : 'vbox',
                    pack : 'start',
                    align : 'stretch'
                },
                items : [{
                    isFormField : false,
                    id : 'vm_profile',
                    name : 'vm_profile',
                    fieldLabel : 'VM Profile',
                    xtype : 'combo',
                    mode : 'local',
                    triggerAction : 'all',
                    forceSelection : true,
                    editable : false,
                    // readOnly: true,
                    displayField : 'profile',
                    valueField : 'id',
                    queryMode : 'local',
                    store : Ext.getStore("VmProfilesStore"),
                    listeners : {
                        change : function(combo, newValue, oldValue, eOpts) {
                            this.vmProfile = Ext.getStore("VmProfilesStore").getById(newValue);
                            if (this.vmProfile) {
                                var vmFields = ['memory', 'diskspace', 'num_cores'];
                                Ext.Array.each(vmFields, function(name, index) {
                                    if (this.vmProfile.get(name)) {
                                        Ext.getCmp(name).setValue(this.vmProfile.get(name));
                                    }
                                }.bind(this));
                            }
                        }.bind(this)
                    }
                }, {
                    id : 'allocation_policy',
                    name : 'allocation_policy',
                    isFormField : false,
                    fieldLabel : 'Allocation policy',
                    xtype : 'combo',
                    mode : 'local',
                    triggerAction : 'all',
                    forceSelection : true,
                    editable : false,
                    displayField : 'hostname',
                    valueField : 'id',
                    queryMode : 'local',
                    store : Ext.getStore("AllocationPolicyStore").load(),
                    listeners : {

                        change : function(combo, newValue, oldValue, eOpts) {
                            this.loadTemplates();
                            if (newValue !== "automatic") {
                                var computeId = newValue;
                                var comp = Ext.getStore('AllocationPolicyStore').getById(computeId);
                                this.parentCompute = comp;
                                var templatesStore = this.parentCompute.getList('templates');
                                if (!templatesStore) {
                                    this.parentCompute.updateSubset('templates', 1, function(templatesStore) {
                                        this.loadTemplates(templatesStore);
                                    }.bind(this), function(error) {
                                        console.error('Error while loading data: ', error);
                                        return;
                                    });
                                } else {
                                    this.loadTemplates(templatesStore);
                                }

                                if (!this.parentCompute.getList('vms')) {
                                    // Going to update vms subset to get
                                    // the url from that
                                    this.parentCompute.updateSubset('vms', 1, function(vmsStore) {
                                    }, function(error) {
                                        console.error('Error while loading data: ', error);
                                        return;
                                    });
                                }
                            } else {
                                var store = Ext.getStore('TemplatesStore');
                                if (store.getCount() == 0) {// don't load again when switching between alloc policy items
                                    store.load({
                                        scope : this,
                                        callback : function(records, operation, success) {
                                            if (success) {
                                                this.loadTemplates(Ext.getStore('TemplatesStore'));
                                                this.parentCompute = null;
                                            }
                                        }
                                    });
                                } else {
                                    this.loadTemplates(Ext.getStore('TemplatesStore'));
                                }
                            }
                        }.bind(this),
                        afterrender : function(combo, eOpts) {
                            var id = (this.parentCompute) ? this.parentCompute.getId() : 'automatic';
                            combo.select(id);
                        }.bind(this)
                    }

                }, {
                    xtype : 'container',
                    layout : {
                        type : 'table',
                        columns : 2
                    },
                    items : [{
                        fieldLabel : "Memory",
                        name : 'memory',
                        id : 'memory',
                        xtype : 'numberfield',
                        step : 0.1,
                        labelWidth : 160,
                        width : 220,
                        style : {
                            marginRight : '10px'
                        },
                        value : 0.5
                    }, {
                        fieldLabel : "Swap",
                        name : 'swap_size',
                        id : 'swap_size',
                        xtype : 'numberfield',
                        step : 0.1,
                        labelWidth : 160,
                        width : 220,
                        value : 0.5
                    }, {
                        fieldLabel : "CPUs",
                        name : 'num_cores',
                        id : 'num_cores',
                        xtype : 'numberfield',
                        labelWidth : 160,
                        width : 220,
                        value : 1
                    }, {
                        fieldLabel : "Disk",
                        name : 'diskspace',
                        id : 'diskspace',
                        xtype : 'numberfield',
                        allowDecimals : true,
                        decimalPrecision : 2,
                        step : 0.5,
                        labelWidth : 160,
                        width : 220,
                        value : 1
                    }]
                }, {
                    isFormField : false,
                    id : 'storage_location',
                    name : 'storage_location',
                    fieldLabel : 'Storage location',
                    xtype : 'combo',
                    mode : 'local',
                    value : 'default',
                    triggerAction : 'all',
                    forceSelection : true,
                    editable : false,
                    readOnly : true,
                    displayField : 'name',
                    valueField : 'value',
                    queryMode : 'local',
                    store : Ext.create('Ext.data.Store', {
                        fields : ['name', 'value'],
                        data : [{
                            name : 'Default',
                            value : 'default'
                        }]
                    })
                }]

            }, {
                xtype : 'fieldset',
                title : (Onc.model.AuthenticatedUser.isAdmin()) ? "3.Set network parameters" : "3.Set hostname",
                layout : {
                    type : 'table',
                    columns : 2
                },
                items : [{
                    fieldLabel : this.labelsMapDefaults['hostname'],
                    name : 'hostname',
                    id : 'hostname',
                    xtype : 'textfield',
                    style : {
                        marginRight : '10px'
                    },
                    labelWidth : 70,
                    width : 280,
                }, {
                    fieldLabel : "IP Address",
                    name : 'ipv4_address',
                    id : 'ipv4_address',
                    xtype : 'textfield',
                    labelWidth : 70
                }, {
                    fieldLabel : "Nameservers",
                    name : 'nameservers',
                    id : 'nameservers',
                    width : 280,
                    xtype : 'textfield',
                    labelWidth : 70
                }, {
                    isFormField : false,
                    hidden : true,
                    fieldLabel : "Mask",
                    name : 'ipv4_mask',
                    id : 'ipv4_mask',
                    xtype : 'textfield',
                    labelWidth : 70
                }]
            }, {
                xtype : 'fieldset',
                title : "4.Set credentials",
                id : 'credentialsFieldset',
                layout : {
                    type : 'vbox',
                    pack : 'start',
                    align : 'stretch'
                },
                items : [{
                    flex : 1,
                    fieldLabel : "Root Password",
                    name : 'root_password',
                    id : 'root_password',
                    xtype : 'textfield',
                    inputType : 'password',
                    labelWidth : 120
                }, {
                    flex : 2,
                    fieldLabel : "Root Password (x2)",
                    name : 'root_password_repeat',
                    id : 'root_password_repeat',
                    xtype : 'textfield',
                    inputType : 'password',
                    vtype : 'password',
                    initialPassField : 'root_password',
                    labelWidth : 120
                }, {
                    xtype : 'container',
                    layout : {
                        type : 'hbox'
                    },
                    items : [{
                        isFormField : false,
                        flex : 1,
                        xtype : 'checkbox',
                        name : 'start_vm',
                        id : 'start_vm',
                        fieldLabel : "Start VM"
                    }, {
                        flex : 2,
                        xtype : 'checkbox',
                        name : 'start_on_boot',
                        id : 'start_on_boot',
                        fieldLabel : "Start on boot"
                    }]
                }]
            }, {
                xtype : 'fieldset',
                title : "4.Default credentials",
                id : 'credentialsFieldsetKvm',
                hidden : true,
                layout : {
                    type : 'table',
                    columns: 2
                },
                items : [{
                    flex : 1,
                    xtype : 'label',
                    text : 'Username:'
                }, {
                    flex : 4,
                    xtype : 'label',
                    id : 'templateUsername',
                    text : '',
                    style : 'font-weight:bold; padding-left: 20px'
                }, {
                    flex : 1,
                    xtype : 'label',
                    text : 'Password:'
                }, {
                    flex : 4,
                    xtype : 'label',
                    id : 'templatePassword',
                    text : '',
                    style : 'font-weight:bold; padding-left: 20px'
                }]
            }],

            buttons : [{

                text : 'Cancel',
                handler : function() {
                    this.up('window').destroy();
                }
            }, {
                id : 'submitButton',
                disabled : true,
                text : 'Create',
                cls : 'btn-green',
                itemId : 'create-new-vm-button'
            }]
        };

        this.callParent(arguments);

    }
});
