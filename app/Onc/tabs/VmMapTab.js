Ext.define('Onc.tabs.VmMapTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computevmmaptab',

    layout: 'fit',

    initComponent: function() {
        this.items = [{
            xtype: 'gridpanel',
            hideHeaders: true,
            columnLines: true,
            id: 'vmmap',
            store: 'PhysicalComputesStore',

            columns: [
                {header: 'Name', dataIndex: 'hostname', width: 100},
                //{header: 'Disk pool size', dataIndex: 'diskspace', width: 15},
                {header: 'Map', dataIndex: 'memory_usage', flex: 1,
                    renderer: function(totalMemory, meta, rec) {
                        var freeMemory = totalMemory,
                            vms = rec.getChild('vms').children(),
                            vm_list = "";

                        vms.each( function(vm) {
                            var memory = vm.get('memory'),
                                width = parseInt(200 * (memory / totalMemory));
                            freeMemory -= memory;
                            vm_list += ['<div class="node-cell" id="vmmap-' + vm.get('id') + '"',
                                ' style="min-width:' + width + 'px">',
                                '<div class="name">' + vm.get('hostname') + '</div>',
                                //'<div class="name">' + vm.get('ipv4_address') + '</div>',
                                '<div class="mem">' + parseInt(memory) + '</div>',
                                '<span class="uptime">' + vm.getUptime() + '</span>',
                                '<span class="cores">' + vm.get('num_cores') + '</span>',
                                '</div>'].join('\n');
                        });

                        if (freeMemory) {
                            var width = parseInt(200 * (freeMemory / totalMemory));
                            vm_list += ['<div class="node-cell free" style="min-width:"' + width + 'px">',
                                '<div class="name">free</div>',
                                '<div class="mem">' + parseInt(freeMemory) + '</div>',
                                '</div>'].join('\n');
                        }

                        return vm_list;
                    }
                }
            ]
        }];

        this.callParent(arguments);
    },

    afterRender: function() {
        var me = this;
        me.mon(Ext.getCmp('vmmap').getStore(), {
            scope: me,
            update: me.updateCell
        });
    },

    updateCell: function(store, rec, action) {
        if (action === 'edit') {
            var el = Ext.get('vmmap-' + rec.get('id'));
            if (el) {
                el.child('div.name', true).innerHTML = rec.get('hostname');
                el.child('div.mem', true).innerHTML = rec.get('memory');
                el.child('span.uptime', true).innerHTML = rec.getUptime();
                el.child('span.cores', true).innerHTML = rec.get('num_cores');
            }
        }
    },
});
