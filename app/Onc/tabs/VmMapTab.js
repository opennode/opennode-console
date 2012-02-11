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
                    icon: 'img/icon/refresh.png',
                    text: 'Refresh',
                    scope: this,
                    handler: this.updateAll
                }, {
                    icon: 'img/icon/resize.png',
                    itemId: 'resize',
                    text: 'Resize',
                    scope: this,
                    handler: this.onResizeClick
                }, {
                    iconCls: 'icon-group',
                    itemId: 'group',
                    text: 'Group',
                    disabled: true,
                    hidden: true,
                    scope: this,
                    handler: this.onGroupClick
                }, {
                    icon: 'img/icon/migrate.png',
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
                                uptime = this.getUptime(vm),
                                width = parseInt(200 * (memory / totalMemory)),
                                selected = this.selection.contains(id) ? ' selected' : '';

                            freeMemory -= memory;
                            vm_list += ['<div class="node-cell' + selected +
                                ((uptime === 'inactive') ? ' inactive' : '') + '"' +
                                ' id="' + id + '"',
                                ' style="min-width:' + width + 'px">',
                                '<div class="name">' + vm.get('hostname') + '</div>',
                                //'<div class="name">' + vm.get('ipv4_address') + '</div>',
                                '<div class="mem">' + parseInt(memory) + '</div>',
                                '<span class="uptime">' + uptime + '</span>',
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

            updateCell: function(store, rec) {
                var el = Ext.get('vmmap-' + rec.get('id'));
                if (el) {
                    el.child('div.name', true).innerHTML = rec.get('hostname');
                    el.child('div.mem', true).innerHTML = rec.get('memory');
                    el.child('span.uptime', true).innerHTML = this.getUptime(rec);
                    el.child('span.cores', true).innerHTML = rec.get('num_cores');
                }
            },

            updateCellEvent: function(store, rec, action) {
                if (action === 'edit') {
                    this.updateCell(store, rec);
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
            },

            onMouseDoubleClick: function(e, el) {
                el = e.getTarget('div.node-cell');
                el = Ext.get(el);
                if (el) {
                    this.fireEvent('showvmdetails', el.id.substring(6));
                    return;
                }

                el = e.getTarget('tr.x-grid-row');
                if (el) {
                    this.fireEvent('showvmdetails', this.getView().getRecord(el).get('id'));
                }
            }
        }];

        this.callParent(arguments);
    },

    afterRender: function() {
        var me = this,
            vmmap = Ext.getCmp('vmmap');
        me.vmmap = vmmap;

        me.callParent(arguments);

        me.mon(vmmap.getStore(), {
            scope: vmmap,
            update: vmmap.updateCellEvent
        });
        me.mon(vmmap.getEl(), 'click', vmmap.onMouseClick, vmmap);
        me.mon(vmmap.getEl(), 'dblclick', vmmap.onMouseDoubleClick, vmmap);

        vmmap.addEvents('showvmdetails', 'startvms', 'stopvms');
    },

    updateAll: function() {
        var vmmap = this.vmmap,
            store = vmmap.store;
        store.each(function(record) {
            vmmap.updateCell(store, record);
        });
    },

    onGroupClick: function() {
        var cellList = "";
        this.vmmap.selection.each(function(id) {
            cellList += id + '<br>';
        });
        Ext.Msg.alert('Group', cellList);
    },

    onResizeClick: function(button) {
        this.resizeMode = !this.resizeMode;
        button.setText(this.resizeMode ? 'Disable Resizing' : 'Resize');

        if (this.resizeMode) {
            var allCells = Ext.select('div.node-cell', true, this.el.dom);
            for (i = 0; i < allCells.getCount(); i++) {
                var cellEl = allCells.item(i);
                var cell = cellEl.dom;
                var resizeContainer = document.createElement("div");
                var resizer = document.createElement("div");
                resizeContainer.className = 'resize-container';
                resizer.className = 'resizer';
                Ext.fly(resizer).setHeight(cellEl.getHeight());
                cell.parentNode.insertBefore(resizeContainer, cell.nextSibling);
                cell.parentNode.removeChild(cell);
                resizeContainer.appendChild(cell);
                resizeContainer.appendChild(resizer);
            }
        } else {
            var resizers = Ext.select('div.resizer', true, this.el.dom);
            for (i = 0; i < resizers.getCount(); i++) {
                var resizer = resizers.item(i);
                var resizeContainer = resizer.dom.parentNode;
                var cell = resizeContainer.firstChild;
                resizeContainer.removeChild(cell);
                resizeContainer.parentNode.insertBefore(cell, resizeContainer.nextSibling);
                resizeContainer.parentNode.removeChild(resizeContainer);
                resizer.remove();
            }
        }
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

            this.dropZone = new Ext.dd.DropZone(this.getEl(), {
                getTargetFromEvent: function(e) {
                    //return e.getTarget(Ext.getCmp('vmmap').getView().rowSelector);
                    //return e.getTarget('#vmmap tr.x-grid-row');
                    return e.getTarget('tr.x-grid-row');
                },

                onNodeDrop: function(target, dd, e, data) {
                    var id = data.sourceEl.id.substring(6),
                        nodeRec = Ext.getStore('ComputesStore').findRecord('id', id);
                        targetRec = Ext.getCmp('vmmap').getView().getRecord(target);
                    Ext.Msg.show({
                        msg: "Migrate " + nodeRec.get('hostname') +
                            " to " + targetRec.get('hostname') + "?",
                        buttons: Ext.Msg.OKCANCEL,
                        icon: Ext.Msg.QUESTION
                    });
                    return true;
                }
            });

        } else {
            this.dragZone.unreg();
            delete this.dragZone;
            this.dropZone.unreg();
            delete this.dropZone;
        }
    }
});
