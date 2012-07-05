Ext.define('Onc.tabs.VmListTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computevmlisttab',

    layout: 'fit',

    initComponent: function() {
        var rec = this.record;

        this.addEvents('groupStop', 'groupStart');

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

            tbar: this._createTbarButtons(),
            //plugins: Ext.create('Ext.grid.plugin.RowEditing'),

            columns: [
                {header: 'State', xtype: 'templatecolumn', tpl: '<div class="state-icon" title="{state}"></div>', width: 40},
                {header: 'Name', dataIndex: 'hostname', width: 75, editor: {xtype: 'textfield', allowBlank: false}},
                {header: 'Inet4', dataIndex: 'ipv4_address', editor: {xtype: 'textfield', allowBlank: true}},
                {header: 'Inet6', dataIndex: 'ipv6_address', editor: {xtype: 'textfield', allowBlank: true}},

                {header: 'actions', renderer: makeColumnRenderer(function(domId, _, _, vmRec) {
                    this._createComputeStateControl(domId, vmRec, _);
                }.bind(this))},

                this._makeGaugeColumn('CPU usage', 'cpu'),
                this._makeGaugeColumn('Memory usage', 'memory', 'MB'),
                this._makeGaugeColumn('Disk usage', 'diskspace', 'MB'),

                {header: 'ID', dataIndex: 'id', width: 130, hidden: true}
            ]
        }];

        this.callParent(arguments);
    },


    // Helper methods

    _createTbarButtons: function(){
        var actions = [{
            text: 'Start',
            icon: 'Start',
            handler: function(vms) {
                this.fireEvent('groupStart', vms);
            }.bind(this)
        }, {
            text: 'Shut Down',
            icon: 'Standby',
            handler: function(vms) {
                this.fireEvent('groupStop', vms);
            }.bind(this)
        }];

        var tbarButtons = actions.map(function(action) {
            return {
                icon: 'img/icon/' + action.icon + '16.png',
                listeners: {
                    'click': function() {
                        var selectedItems = this.child('gridpanel').getSelectionModel().getSelection();
                        if (selectedItems.length === 0)
                            Ext.Msg.show({title: "Error", msg: "Please select a VM from the list.",
                                buttons: Ext.Msg.OK, icon: Ext.Msg.ERROR});
                        else
                            action.handler(selectedItems);
                    }.bind(this)
                }
            };
        }.bind(this));

        tbarButtons.unshift({xtype: 'tbseparator'});
        tbarButtons.unshift({
            itemId: 'new-vm-button',
            text: 'New',
            icon: 'img/icon/add.png',
            tooltip: 'Add a new virtual machine'
        },
        !ENABLE_VMLIST_DELETE ? [] : {
            itemId: 'delete-vm-button',
            text: 'Delete',
            icon: 'img/icon/delete.png',
            tooltip: 'Delete the selected virtual machines'
        });

        return tbarButtons;
    },

    _createComputeStateControl: function(domId, vmRec, _){
        return Ext.widget('computestatecontrol', {
            compute: vmRec,
            initialState: (vmRec.get('state') === 'active' ? 'running' :
                    vmRec.get('state') === 'suspended' ? 'suspended' : 'stopped'),
            renderTo: domId,
        });
    },

    _makeGaugeColumn: function(label, name, unit) {
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
});
