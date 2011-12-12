Ext.define('Onc.tabs.NetworkTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computenetworktab',

    layout: {type: 'vbox', align: 'stretch'},

    initComponent: function() {
        var me = this;
        var rec = this.record;

        this.items = [{
            xtype: 'gridpanel',
            flex: 3,
            title: 'Bridge Interfaces',
            forceFit: true,
            multiSelect: true,
            store: rec.getList('interfaces'),
            tbar: [{icon: 'img/icon/add.png'},
                   {icon: 'img/icon/delete.png'}],
            plugins: Ext.create('Ext.grid.plugin.RowEditing'),

            columns: [
                {header: 'Name', dataIndex: 'id', width: 40, editor: {xtype: 'textfield', allowBlank: false }},
                {header: 'Inet4', dataIndex: 'ipv4_address', width: 75, editor: {xtype: 'textfield', allowBlank: true }},
                {header: 'Inet6', dataIndex: 'ipv6_address', width: 150, editor: {xtype: 'textfield', allowBlank: true }},
                {header: 'Members', dataIndex: 'members', width: 150,
                 renderer: function (members, _, rec) {
                     if (!members) return '';

                     var id = Ext.id();
                     var memberData = members.map(function(memberName) {
                         return {name: memberName};
                     });
                     // 'afterrender' won't work because it is called before this renderer,
                     // so delayed rendering seems to be the only solution, albeit hacky.
                     setTimeout(function() {
                         Ext.create('Ext.view.View', {
                             style: 'overflow: auto',
                             renderTo: id,
                             cls: 'bridge-interface-members',
                             tpl: '<tpl for="."><div class="bridge-interface-member">{name}</div></tpl>',
                             itemSelector: '.bridge-interface-member',
                             store: Ext.create('BridgeMembersStore', {
                                 data: memberData,
                                 parentRecord: rec
                             }),
                         });
                     }, 0);
                     return Ext.String.format('<div id="{0}"></div>', id);
                 }
                },
                {header: 'Subnet Mask', dataIndex: 'subnet_mask', width: 75},
                {header: 'Broadcast', dataIndex: 'bcast', width: 75, editor: {xtype: 'textfield', allowBlank: true }},
                {header: 'Hardware Address', dataIndex: 'hw_address', editor: {xtype: 'textfield', allowBlank: true }},
                {header: 'Metric', dataIndex: 'metric', width: 25, editor: {xtype: 'textfield' }},
                {header: 'STP', dataIndex: 'stp', width: 40, editor: {xtype: 'textfield' }},
                {header: 'RX', dataIndex: 'rx', width: 50, hidden: true},
                {header: 'TX', dataIndex: 'tx', width: 50, hidden: true}
            ]
        }, {
            xtype: 'gridpanel',
            flex: 2,
            title: 'Kernel IP Routing Table',
            forceFit: true,
            multiSelect: true,
            tbar: [{icon: 'img/icon/add.png'},
                   {icon: 'img/icon/delete.png'}],
            plugins: Ext.create('Ext.grid.plugin.RowEditing'),

            columns: [
                {header: 'Destination', dataIndex: 'destination', editor: {xtype: 'textfield', allowBlank: false }},
                {header: 'Gateway', dataIndex: 'gateway', editor: {xtype: 'textfield', allowBlank: false }},
                {header: 'Genmask', dataIndex: 'genmask', editor: {xtype: 'textfield', allowBlank: false }},
                {header: 'Flags', dataIndex: 'flags', editor: {xtype: 'textfield', allowBlank: false }},
                {header: 'Metric', dataIndex: 'metric', editor: {xtype: 'textfield', allowBlank: false }},
                {header: 'Iface', dataIndex: 'iface', editor: {xtype: 'textfield', allowBlank: false }}
            ],

            // store: rec.routes(),
            store: Ext.create('Ext.data.Store', {
                model: 'Onc.model.IpRoute',
                data: [
                    {destination: '192.168.12.34', gateway: '192.168.43.56', genmask: '255.144.033.022', flags: 'WOW', metric: '1', iface: 'babyface'},
                    {destination: '192.168.21.43', gateway: '91.261.8345.6', genmask: '55.1440.330.222', flags: 'OWW', metric: '1', iface: 'abyfaceb'}
                ]
            })
        }];

        this.callParent(arguments);
    },

    listeners: {
        'afterrender': function() {
            var gridPanel = this.child('gridpanel');

            Ext.create('Ext.dd.DragZone', gridPanel.getEl(), {
                getDragData: function(event) {
                    var sourceEl = event.getTarget('.bridge-interface-member');
                    if (!sourceEl) return null;

                    var containerEl = Ext.fly(sourceEl).findParent('.bridge-interface-members');
                    var dataView = Ext.getCmp(containerEl.id);
                    return {
                        ddel: sourceEl,
                        record: dataView.getRecord(sourceEl),
                        sourceStore: dataView.getStore()
                    };
                }
            });

            Ext.create('Ext.dd.DropZone', gridPanel.getEl(), {
                getTargetFromEvent: function(event) {
                    return event.getTarget('.bridge-interface-members');
                },

                onNodeEnter: function(target) { Ext.fly(target).addCls('drop-hover'); },
                onNodeOut: function(target) { Ext.fly(target).removeCls('drop-hover'); },

                onNodeDrop: function(target, _, event, data) {
                    var targetDataView = Ext.getCmp(target.id);
                    var targetStore = targetDataView.getStore();

                    // Only copy if not dragging from nobr:
                    if (!event.altKey || data.sourceStore.parentRecord.get('id') === 'nobr')
                        data.sourceStore.remove(data.record);

                    // If item was dragged onto nobr, remove from all bridges:
                    if (targetStore.parentRecord.get('id') === 'nobr') {
                        Ext.fly(target).findParent('.x-grid-view', null, true)
                            .select('.bridge-interface-members')
                            .each(function(dataViewEl) {
                                var store = Ext.getCmp(dataViewEl.id).getStore();
                                store.removeAt(store.findExact('name', data.record.get('name')));
                            });
                    }
                    targetStore.add(data.record);

                    return true;
                }
            });

        }
    }
});


Ext.define('BridgeMembersStore', {
    extend: 'Ext.data.Store',
    fields: ['name'],
    sorters: {
        // Sorts so that 'ethX' comes before 'vnetX':
        sorterFn: function(o1, o2) {
            var n1 = o1.get('name');
            var n2 = o2.get('name');
            if (n1.startswith('eth') && !n2.startswith('eth'))
                return -1;
            else if (!n1.startswith('eth') && n2.startswith('eth'))
                return 1;
            else
                return n1 > n2 ? 1 : -1;
        }
    },
    add: function(records) {
        if (!(records instanceof Array))
            records = Array.prototype.slice.apply(arguments);
        // Filter out duplicates:
        records = records.filter((function(rec) {
            return -1 === this.findExact('name', rec.get('name'));
        }).bind(this));
        return this.callParent([records]);
    },
    listeners: {
        'add': function(_, records) {
            // XXX: store.add will throw errors if this is delayed
            setTimeout(this.sort.bind(this), 0);
        }
    }
});
