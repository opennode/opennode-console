Ext.define('Onc.tabs.VmListTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computevmlisttab',

    layout: 'fit',

    initComponent: function() {
        var me = this;
        var rec = this.record;

        this.addEvents('showdetails', 'vmsstart', 'vmsstop', 'vmssuspend', 'vmsgraceful', 'vmedit');

        var actions = [
            {text: 'Start', icon: 'Start', handler: function(vms) {
                me.down('grid').setLoading(true, true);
                me.fireEvent('vmsstart', vms, function() {
                    me.down('grid').setLoading(false);
                });
            }},
            {text: 'Shut Down', icon: 'Standby', handler: function(vms) {
                me.down('grid').setLoading(true, true);
                me.fireEvent('vmsstop', vms, function() {
                    me.down('grid').setLoading(false);
                });
            }},
            {text: 'Show Details', icon: 'ZoomIn', handler: function(vms) {
                console.assert(vms.length === 1);
                me.fireEvent('showdetails', vms[0]);
            }}
        ];

        var tbarButtons = actions.map(function(action) {
            return {
                icon: 'img/icon/' + action.icon + '16.png',
                listeners: {
                    'click': function() {
                        var selectedItems = me.child('gridpanel').getSelectionModel().getSelection();
                        if (selectedItems.length === 0)
                            Ext.Msg.show({title: "Error", msg: "Please select a VM from the list.",
                                          buttons: Ext.Msg.OK, icon: Ext.Msg.ERROR});
                        else
                            action.handler(selectedItems);
                    }
                }
            };
        });

        tbarButtons.pop();  // Don't want the 'Show Details' button for multiple VMs

        tbarButtons.unshift({xtype: 'tbseparator'});
        tbarButtons.unshift({
            itemId: 'new-vm-button', text: 'New', icon: 'img/icon/add.png', tooltip: 'Add a new virtual machine'
        }, !ENABLE_VMLIST_DELETE ? [] : {
            itemId: 'delete-vm-button', text: 'Delete', icon: 'img/icon/delete.png', tooltip: 'Delete the selected virtual machines'
        });

        var rowActions = actions.map(function(action) {
            return {
                tooltip: action.text,
                altText: action.text,
                icon: 'img/icon/' + action.icon + '.png',
                handler: function(actionName, rowIndex) {
                    var compute = me.child('gridpanel').getStore().getAt(rowIndex);
                    action.handler([compute]);
                }
            };
        });

        function _makeGaugeColumn(label, name, unit) {
            return {
                header: label,
                width: 80,
                align: 'center',
                dataIndex: 'id',
                renderer: makeColumnRenderer(function(domId, _, _, rec) {
                    if(!rec.gaugeMetadata)
                        rec.gaugeMetadata = {};
                    if(!rec.gaugeMetadata[label])
                        rec.gaugeMetadata[label] = {};
                    var metadata = rec.gaugeMetadata[label];

                    var max = (name === 'cpu' ? rec.getMaxCpuLoad()
                               : name === 'diskspace' ? rec.get('diskspace')['total']
                               : rec.get(name));

                    metadata.gauge = Ext.create('Onc.widgets.Gauge', {
                        renderTo: domId,
                        border: false,
                        max: max,
                        unit: unit,
                        display: name === 'cpu' ? ['fixed', 2] : undefined,
                        value: metadata.lastValue
                    });

                    var url = rec.get('url') + '/metrics/{0}_usage'.format(name);

                    if (!metadata.listener) {
                        metadata.listener = function(data) {
                            this.gauge.setValue(data[url]);
                            this.lastValue = data[url];
                        }.bind(metadata);

                        Onc.hub.Hub.subscribe(metadata.listener, [url], 'gauge', function() {
                            var active = rec.get('state') == 'active';
                            if (!active)
                                metadata.gauge.setValue(0);
                            // TODO: also change here widget active/inactive class if we want differenty visualization
                            return active;
                        });
                    }
                })
            };
        }

        function _changeStateWithConfirmation(confirmTitle, confirmText, eventName, target, cb) {
            Ext.Msg.confirm(confirmTitle, confirmText,
                function(choice) {
                    if (choice === 'yes') {
                        me.down('grid').setLoading(true, true);
                        me.fireEvent(eventName, target, function() {
                                    if(cb) {cb();}
                                    me.down('grid').setLoading(false);
                                    });
                    }
                });
        }

        this.items = [{
            xtype: 'gridpanel',
            title: "Virtual Machines",
            forceFit: true,
            multiSelect: true,

            store: rec.getChild('vms').children(),

            viewConfig: {
                getRowClass: function(record) {
                    return 'compute state-' + record.get('state');
                }
            },

            tbar: tbarButtons,
            //plugins: Ext.create('Ext.grid.plugin.RowEditing'),

            columns: [
                {header: 'State', xtype: 'templatecolumn', tpl: '<div class="state-icon" title="{state}"></div>', width: 40},
                {header: 'Name', dataIndex: 'hostname', width: 75, editor: {xtype: 'textfield', allowBlank: false}},
                {header: 'Inet4', dataIndex: 'ipv4_address', editor: {xtype: 'textfield', allowBlank: true}},
                {header: 'Inet6', dataIndex: 'ipv6_address', editor: {xtype: 'textfield', allowBlank: true}},

                {header: 'actions', renderer: makeColumnRenderer(function(domId, _, _, vmRec) {
                    Ext.widget('computestatecontrol', {
                        initialState: (vmRec.get('state') === 'active' ?
                                       'running' :
                                       vmRec.get('state') === 'suspended' ?
                                       'suspended' :
                                       'stopped'),
                        renderTo: domId,
                        listeners: {
                            'start': function(_, cb) { _changeStateWithConfirmation('Starting a VM',
                                       'Are you sure you want to boot this VM?',
                                       'vmsstart',
                                       [vmRec],
                                       cb);
                            },
                            'suspend': function(_, cb) { me.fireEvent('vmssuspend', [vmRec], cb); },
                            'graceful': function(_, cb) {
                                _changeStateWithConfirmation('Shutting down a VM',
                                       'Are you sure? All of the processes inside a VM will be stoppped',
                                       'vmsgraceful',
                                       [vmRec],
                                       cb);
                            },
                            'stop': function(_, cb) { me.fireEvent('vmsstop', [vmRec], cb); },
                            'details': function(_, cb) { me.fireEvent('showdetails', vmRec, cb); },
                            'delete': function(_, cb) { _changeStateWithConfirmation('Deleting a VM',
                                    'Are you sure you want to delete this VM?',
                                    'vmsdelete',
                                    vmRec,
                                    cb);
                            },
                            'edit' : function(_, cb) { me.fireEvent('vmedit', vmRec, cb); }
                        }
                    });
                })},
                _makeGaugeColumn('CPU usage', 'cpu'),
                _makeGaugeColumn('Memory usage', 'memory', 'MB'),
                _makeGaugeColumn('Disk usage', 'diskspace', 'MB'),

                {header: 'ID', dataIndex: 'id', width: 130, hidden: true}
            ]
        }];

        this.callParent(arguments);
    }
});
