Ext.define('Onc.tabs.VmMapTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computevmmaptab',
    requires: 'Ext.util.MixedCollection',

    layout: 'fit',

    initComponent: function() {
        this.items = [{
            xtype: 'gridpanel',
            hideHeaders: true,
            columnLines: true,
            id: 'vmmap',
            store: 'PhysicalComputesStore',
            selection: Ext.create('Ext.util.MixedCollection'),

            dockedItems: [
                {xtype: 'toolbar',
                itemId: 'toolbar',
                items: [{
                    iconCls: 'icon-resize',
                    itemId: 'resize',
                    text: 'Resize',
                    disabled: true,
                    scope: this,
                    handler: this.onResizeClick
                }, {
                    iconCls: 'icon-group',
                    itemId: 'group',
                    text: 'Group',
                    disabled: true,
                    scope: this,
                    handler: this.onGroupClick
                }, {
                    iconCls: 'icon-migrate',
                    itemId: 'migrate',
                    text: 'Migrate',
                    scope: this,
                    handler: this.onMigrateClick
                }]}
            ],

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
                                id = 'vmmap-' + vm.get('id'),
                                width = parseInt(200 * (memory / totalMemory)),
                                selected = this.selection.contains(id) ? ' selected' : '';

                            freeMemory -= memory;
                            vm_list += ['<div class="node-cell' + selected + '"' +
                                ' id="' + id + '"',
                                ' style="min-width:' + width + 'px">',
                                '<div class="name">' + vm.get('hostname') + '</div>',
                                //'<div class="name">' + vm.get('ipv4_address') + '</div>',
                                '<div class="mem">' + parseInt(memory) + '</div>',
                                '<span class="uptime">' + this.getUptime(vm) + '</span>',
                                '<span class="cores">' + vm.get('num_cores') + '</span>',
                                '</div>'].join('\n');
                        }, this);

                        if (freeMemory) {
                            var width = parseInt(200 * (freeMemory / totalMemory));
                            vm_list += ['<div class="node-cell-free" style="min-width:"' + width + 'px">',
                                '<div class="name">free</div>',
                                '<div class="mem">' + parseInt(freeMemory) + '</div>',
                                '</div>'].join('\n');
                        }

                        return vm_list;
                    }
                }
            ],

            getUptime: function(rec) {
                if (rec.get('state') === 'inactive')
                    return 'inactive';
                var timestamp = new Date(Date.parse(rec.get('startup_timestamp')));

                var s = Math.round((+(new Date()) - +timestamp) / 1000);

                var days = Math.floor(s / 86400);
                s -= days * 86400;

                var hours = Math.floor(s / 3600);

                return '' + days + 'd ' + (hours ? (hours + 'h ') : '');
            },

            updateCell: function(store, rec, action) {
                if (action === 'edit') {
                    var el = Ext.get('vmmap-' + rec.get('id'));
                    if (el) {
                        el.child('div.name', true).innerHTML = rec.get('hostname');
                        el.child('div.mem', true).innerHTML = rec.get('memory');
                        el.child('span.uptime', true).innerHTML = this.getUptime(rec);
                        el.child('span.cores', true).innerHTML = rec.get('num_cores');
                    }
                }
            },

            onMouseClick: function(e, el) {
                el = e.getTarget('div.node-cell');
                el = Ext.get(el);
                if (!el) {
                    return;
                }

                if (e.shiftKey) {
                    var from = this.lastSelectedCell || this.el.down('div.node-cell'),
                        allCells = Ext.select('div.node-cell', true, this.el.dom),
                        to = allCells.indexOf(el);

                    from = allCells.indexOf(from);
                    if (from > to) {
                        var temp = from;
                        from = to;
                        to = temp;
                    }

                    var i, item;
                    if (!e.ctrlKey) {
                        for (i = 0; i < allCells.getCount(); i++) {
                            if (i < from || i > to) {
                                cell = allCells.item(i);
                                if (this.selection.contains(cell.id)) {
                                    cell.removeCls('selected');
                                }
                            }
                        }
                        this.selection.clear();
                    }

                    for (i = from; i <= to; i++) {
                        cell = allCells.item(i);
                        this.selection.add(cell.id);
                        cell.addCls('selected');
                    }

                } else if (e.ctrlKey) {
                    if (el.hasCls('selected')) {
                        el.removeCls('selected');
                        this.selection.remove(el.id);
                    } else {
                        el.addCls('selected');
                        this.selection.add(el.id);
                    }

                    this.lastSelectedCell = el;

                } else {
                    this.selection.each(function(id) {
                        if (id !== el.id) {
                            Ext.get(id).removeCls('selected');
                        }
                    });
                    this.selection.clear();
                    this.selection.add(el.id);
                    el.addCls('selected');

                    this.lastSelectedCell = el;
                }
                
                var toolbar = this.getDockedComponent('toolbar'),
                    group = toolbar.getComponent('group');
                if (this.selection.getCount() > 0) {
                    group.enable();
                } else {
                    group.disable();
                }
            }
        }];

        this.callParent(arguments);
    },

    afterRender: function() {
        var me = this,
            vmmap = Ext.getCmp('vmmap');

        me.callParent(arguments);

        me.mon(vmmap.getStore(), {
            scope: vmmap,
            update: vmmap.updateCell
        });
        me.mon(vmmap.getEl(), 'click', vmmap.onMouseClick, vmmap);
    },

    onGroupClick: function() {
        this.cellList = "";
        Ext.getCmp('vmmap').selection.each(function(id) {
            this.cellList += id + '<br>';
        }, this);
        Ext.Msg.alert('Group', this.cellList);
    },

    onResizeClick: function() {
    },

    onMigrateClick: function(button) {
        this.migrateMode = !this.migrateMode;
        button.setText(this.migrateMode ? 'Disable Migration' : 'Migrate');

        if (this.migrateMode) {
            this.dragZone = new Ext.dd.DragZone(this.getEl(), {
                getDragData: function(e) {
                    var cell = e.getTarget('div.node-cell');
                    if (cell) {
                        var clone = cell.cloneNode(true);
                        clone.id = Ext.id();
                        return {
                            ddel: clone,
                            sourceEl: cell,
                            repairXY: Ext.fly(cell).getXY(),
                            dragSource: this
                        }
                    }
                },

                getRepairXY: function() {
                    return this.dragData.repairXY;
                }
            });
        } else {
            this.dragZone.unreg();
            delete this.dragZone;
        }
    }
});
