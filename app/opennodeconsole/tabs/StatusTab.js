Ext.define('opennodeconsole.tabs.StatusTab', {
    extend: 'opennodeconsole.tabs.Tab',
    alias: 'widget.computestatustab',

    layout: 'fit',

    initComponent: function() {
        var me = this;
        var rec = this.record;

        var actions = [
            {
                text: 'Start', icon: 'Start', handler: function(vms) {
                    Ext.Msg.show({title: "FYI", msg: "Starting " + vms.map(function(vm) { return vm.get('hostname'); }).join(", "),
                                  buttons: Ext.Msg.OK, icon: Ext.Msg.INFO});
                }
            },
            {
                text: 'Pause', icon: 'Sleep', handler: function(vms) {
                    Ext.Msg.show({title: "FYI", msg: "Pausing " + vms.map(function(vm) { return vm.get('hostname'); }).join(", "),
                                  buttons: Ext.Msg.OK, icon: Ext.Msg.INFO});
                }
            },
            {
                text: 'Shut Down', icon: 'Standby', handler: function(vms) {
                    Ext.Msg.show({title: "FYI", msg: "Shutting down " + vms.map(function(vm) { return vm.get('hostname'); }).join(", "),
                                  buttons: Ext.Msg.OK, icon: Ext.Msg.INFO});
                }
            },
            {
                text: 'Show Details', icon: 'ZoomIn', handler: function(vms) {
                    console.assert(vms.length === 1);
                    Ext.Msg.show({title: "FYI", msg: "Showing details of " + vms.map(function(vm) { return vm.get('hostname'); }).join(", "),
                                  buttons: Ext.Msg.OK, icon: Ext.Msg.INFO});
                }
            }
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
            text: 'New', icon: 'img/icon/add.png', tooltip: 'Add New Virtual Machine',
            listeners: {
                'click': function() {
                    Ext.create('widget.newvmwindow').show();
                }
            }
        });

        var rowActions = actions.map(function(action) {
            return {
                tooltip: action.text,
                altText: action.text,
                icon: 'img/icon/' + action.icon + '.png',
                handler: function(actionName, _, rowIndex) {
                    var compute = me.child('gridpanel').getStore().getAt(rowIndex);
                    action.handler([compute]);
                }
            };
        });

        function _makeGaugeColumn(label, name) {
            return {
                header: label,
                width: 135,
                dataIndex: 'id',
                renderer: function(vmId, meta) {
                    var id = Ext.id();
                    setTimeout(function() {
                        var gauge = Ext.create('opennodeconsole.widgets.Gauge', {
                            renderTo: id,
                            label: label
                        });
                    }, 0);
                    return Ext.String.format('<div id="{0}"></div>', id);
                }
            };
        }

        this.items = [{
            xtype: 'gridpanel',
            title: "Virtual Machines",
            forceFit: true,
            multiSelect: true,

            store: rec.vms(),

            viewConfig: {
                getRowClass: function(record) {
                    return 'compute state-' + record.get('state');
                }
            },

            tbar: tbarButtons,
            plugins: Ext.create('Ext.grid.plugin.RowEditing'),

            columns: [
                {header: 'ID', dataIndex: 'id', width: 130},
                {header: 'State', xtype: 'templatecolumn', tpl: '<div class="state-icon" title="{state}"></div>', width: 40},
                {header: 'Name', dataIndex: 'hostname', width: 75, editor: {xtype: 'textfield', allowBlank: false}},
                {header: 'Inet4', dataIndex: 'ip_address', editor: {xtype: 'textfield', allowBlank: false}},
                {header: 'Inet6', dataIndex: 'ipv6_address', editor: {xtype: 'textfield', allowBlank: false}},

                _makeGaugeColumn('CPU usage', 'cpuUsage'),
                _makeGaugeColumn('Memory usage', 'memUsage'),
                _makeGaugeColumn('Disk usage', 'diskUsage'),

                {xtype: 'actioncolumn', hideable: false, sortable: false, width: 4 * (32 + 2), items: rowActions}
            ]
        }];

        this.callParent(arguments);
    }
});
