Ext.define('Onc.tabs.VmListTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computevmlisttab',

    layout: 'fit',

    initComponent: function() {
        var me = this;
        var rec = this.record;

        this.addEvents('showvmdetails', 'startvms', 'stopvms');

        var actions = [
            {text: 'Start', icon: 'Start', handler: function(vms) {
                me.down('grid').setLoading(true, true);
                me.fireEvent('startvms', vms, function() {
                    me.down('grid').setLoading(false);
                });
            }},
            // {text: 'Pause', icon: 'Sleep', handler: function(vms) {
            //     Ext.each(vms, function(vm) {
            //         vm.set('state', 'suspended');
            //         vm.save();
            //     });
            // }},
            {text: 'Shut Down', icon: 'Standby', handler: function(vms) {
                me.down('grid').setLoading(true, true);
                me.fireEvent('stopvms', vms, function() {
                    me.down('grid').setLoading(false);
                });
            }},
            {text: 'Show Details', icon: 'ZoomIn', handler: function(vms) {
                console.assert(vms.length === 1);
                me.fireEvent('showvmdetails', vms[0]);
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
        }, {
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

        function _makeGaugeColumn(label, name) {
            return {
                header: label,
                width: 80,
                align: 'center',
                dataIndex: 'id',
                renderer: function(vmId, meta, rec) {
                    var id = Ext.id();
                    setTimeout(function() {
                        // XXX: For some weird reason, when a new
                        // Compute is added, a ghost row is created in
                        // this grid for which this renderer will be
                        // invoked. However, since the row is ghost,
                        // the DOM element with that ID is not
                        // available, causing Gauge to error out.
                        if (!Ext.get(id)) return;

                        var max = (name === 'cpu' ? rec.getMaxCpuLoad()
                                   : name === 'diskspace' ? rec.get('diskspace')['total']
                                   : rec.get(name));

                        var gauge = Ext.create('Onc.widgets.Gauge', {
                            renderTo: id,
                            border: false,
                            max: max
                        });

                        var url = rec.get('url') + '/metrics/{0}_usage'.format(name);
                        var listener = function(data) { gauge.setValue(data[url]); };

                        Onc.hub.Hub.subscribe(listener, [url], 'gauge');
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

            store: rec.getChild('vms').children(),

            viewConfig: {
                getRowClass: function(record) {
                    return 'compute state-' + record.get('state');
                }
            },

            tbar: tbarButtons,
            plugins: Ext.create('Ext.grid.plugin.RowEditing'),

            columns: [
                {header: 'State', xtype: 'templatecolumn', tpl: '<div class="state-icon" title="{state}"></div>', width: 40},
                {header: 'Name', dataIndex: 'hostname', width: 75, editor: {xtype: 'textfield', allowBlank: false}},
                {header: 'Inet4', dataIndex: 'ipv4_address', editor: {xtype: 'textfield', allowBlank: true}},
                {header: 'Inet6', dataIndex: 'ipv6_address', editor: {xtype: 'textfield', allowBlank: true}},

                {xtype: 'actioncolumn', sortable: false, width: 3 * (20 + 2), items: rowActions, align: 'center'},
                _makeGaugeColumn('CPU usage', 'cpu'),
                _makeGaugeColumn('Memory usage', 'memory'),
                _makeGaugeColumn('Disk usage', 'diskspace'),

                {header: 'ID', dataIndex: 'id', width: 130, hidden: true}
            ]
        }];

        this.callParent(arguments);
    }
});
