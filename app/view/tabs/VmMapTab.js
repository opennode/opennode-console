Ext.define('Onc.view.tabs.VmMapTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computevmmaptab',
    requires: 'Ext.util.MixedCollection',

    layout: 'fit',

    _storeLoaded: false,

    listeners: {
        activate: function(){
            if(this._storeLoaded)
                return;

            var store = Ext.getStore('PhysicalComputesStore');
            store.load({
                scope: this,
                callback: function(records, operation, success) {
                    if(!success){
                        Onc.core.EventBus.fireEvent('displayNotification', 'Error while loading data', 'error');
                    }
                    else
                        this._storeLoaded = true;
                }
            });
        }
    },

    initComponent: function() {
        this.items = [{
            xtype: 'gridpanel',
            hideHeaders: true,
            columnLines: true,
            border: true,
            id: 'vmmap',
            store: 'PhysicalComputesStore',
            selection: Ext.create('Ext.util.MixedCollection'),

            dockedItems: !ENABLE_VMMAP_TOOLBAR ? undefined : [
                {xtype: 'toolbar',
                itemId: 'toolbar',
                items: (!ENABLE_VMMAP_REFRESH ? [] : [{
                    icon: 'img/icon/refresh.png',
                    text: 'Refresh',
                    scope: this,
                    handler: this.updateAll
                }]).concat(!ENABLE_VMMAP_RESIZE ? [] : [{
                    icon: 'img/icon/resize.png',
                    itemId: 'resize',
                    text: 'Resize',
                    scope: this,
                    handler: this.onResizeClick
                }]).concat(!ENABLE_VMMAP_TAG ? [] : [{
                    iconCls: 'icon-tag',
                    itemId: 'tag',
                    text: 'Tag',
                    disabled: true,
                    hidden: true,
                    scope: this,
                    handler: this.onTagClick
                }]).concat(!ENABLE_VMMAP_MIGRATE ? [] : [{
                    icon: 'img/icon/migrate.png',
                    itemId: 'migrate',
                    text: 'Migrate',
                    scope: this,
                    handler: this.onMigrateClick
                }]).concat(!ENABLE_VMMAP_LEGEND ? [] : [{
                    xtype: 'tbseparator'
                }, {
                    xtype: 'button',
                    text: 'CPU',
                    iconCls: 'cpu-legend',
                    enableToggle: true,
                    pressed: true
                }, {
                    xtype: 'button',
                    text: 'MEM',
                    iconCls: 'memory-legend',
                    enableToggle: true,
                    pressed: true
                }, {
                    xtype: 'button',
                    text: 'DISK',
                    iconCls: 'disk-legend',
                    enableToggle: true,
                    pressed: true
                }])}
            ],

            tagColors: {
                'env:production' : 'green',
                'env:development' : 'red',
                'env:staging' : 'blue',
                'env:infrastructure' : 'gold'
            },

            tagShortened: {
                'env:production': 'P',
                'env:development' : 'D',
                'env:staging' : 'S',
                'env:infrastructure' : 'I'
            },

            tagTpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="tag" title={name} style="background-color: {color}">{tagShortened}</div>',
               '</tpl>'
            ),

            vmTpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="{classes}" id="{id}" ',
                        'style="min-width:{minwidth}px">',
                        '<tpl if="values.tags !== undefined">',
                            '<div class="tags">',
                                '{[ this.tab.vmmap.tagTpl.apply(values.tags) ]}',
                            '</div>',
                        '</tpl>',
                        '<div class="name">{name}</div>',
                        '<div class="mem">{mem}</div>',
                        '<tpl if="values.id !== undefined">',
                            '<span class="uptime">{uptime}</span>',
                            '<span class="cores">{cores}</span>',
                            '<div class="bar cpubar"><div></div></div>',
                            '<div class="bar memorybar"><div></div></div>',
                            '<div class="bar diskspacebar"><div></div></div>',
                        '</tpl>',
                    '</div>',
                '</tpl>',
                { tab: this }
            ),

            getUsedTags: function(allTags) {
                var usedtags;
                Ext.each(allTags, function(tag) {
                    var color = this.tagColors[tag];
                    var shortened = this.tagShortened[tag];
                    if (color && shortened) {
                        usedtags = usedtags || [];
                        usedtags[usedtags.length] = {name: tag, color: color, tagShortened: shortened};
                    }
                }, this);
                return usedtags;
            },

            columns: [
                {header: 'Name', dataIndex: 'hostname', width: 100,
                    renderer: function(name, meta, rec) {
                        return '<div class="name">' + name + '</div>';
                    }
                },
                {header: 'Map', dataIndex: 'memory', flex: 1,
                    renderer: function(totalMemory, meta, rec) {
                        // FIXME: 'memory' is 0
                        if (!totalMemory) {
                            totalMemory = 2048;
                        }

                        var freeMemory = totalMemory;

                        var r = [];
                        var vms = rec.getChild('vms');
                        // in case HN doesn't have a vms container, we don't show anything (ON-635)
                        if (vms === null)
                            return '';

                        vms.children().each( function(vm) {
                            var id = 'vmmap-' + vm.getId();
                            var classes = 'node-cell';
                            var memory = vm.get('memory');
                            var uptime = this.getUptime(vm);
                            var tags = vm.get('tags');
                            var usedtags = this.getUsedTags(tags);

                            if (this.selection.contains(id)) {
                                classes += ' selected';
                            }
                            if (uptime === 'inactive') {
                                classes += ' inactive';
                            }

                            var hn = vm.get('hostname');
                            // wrap too long host names
                            if (hn.length > 22)
                                hn = hn.substr(0,20) + '..';

                            r[r.length] = {
                                id: id,
                                name: hn,
                                classes: classes,
                                mem: parseInt(memory),
                                uptime: uptime,
                                cores: vm.get('num_cores'),
                                minwidth: Math.max(parseInt(300 * (memory / totalMemory)) + 30,
                                                   parseInt(hn.length * 5.5) + 30),
                                tags: usedtags
                            };

                            freeMemory -= memory;

                            var url = vm.get('url');
                            this.subscribeGauge(vm, url, 'cpu', id, vm.getMaxCpuLoad());
                            this.subscribeGauge(vm, url, 'memory', id, vm.get('memory'));
                            this.subscribeGauge(vm, url, 'diskspace', id, vm.get('diskspace')['total']);
                        }, this);

                        if (freeMemory) {
                            r[r.length] = {
                                name: 'free',
                                classes: 'node-cell-free',
                                mem: parseInt(freeMemory),
                                minwidth: parseInt(300 * (freeMemory / totalMemory))
                            };
                        }

                        return this.vmTpl.apply(r);
                    }
                }
            ],

            subscribeGauge: function(rec, url, name, id, maxValue) {
                url += '/metrics/{0}_usage'.format(name);
                Onc.core.hub.Hub.subscribe(function(data) {
                    var el = Ext.get(id);
                    if (el) {
                        var value = (data[url] / maxValue) * 100;
                        value = (isNaN(value) ? 0 : value.round());
                        el.down('.bar.{0}bar div'.format(name)).setWidth('' + value + '%');
                    }
                }, [url], 'gauge', function() {
                    var active = rec.get('state') == 'active';
                    if (!active) {
                        var el = Ext.get(id);
                        if (el)
                            el.down('.bar.{0}bar div'.format(name)).setWidth('' + 0 + '%');
                    }
                    return active;
                });
            },

            listeners: {
                'afterrender': function(cmp, eOpts ){
                    this.mon(this.el, 'click', this.onMouseClick, this);
                    this.mon(this.el, 'dblclick', this.onMouseDoubleClick, this);
                    this.mon(this.store, {scope: this, update: this.updateCellEvent});

                    this.addEvents('showvmdetails');//, 'startvms', 'stopvms');
                }
            },

            getUptime: function(rec) {
                if (rec.get('state') === 'inactive')
                    return 'inactive';

                var s = Math.round(rec.get('uptime'));

                var days = Math.floor(s / 86400);
                s -= days * 86400;

                var hours = Math.floor(s / 3600);
                s -= hours * 3600;

                var mins = Math.floor(s / 60);

                if (days) {
                    return '' + days + 'd ' + hours + 'h';
                }
                if (hours) {
                    return '' + hours + 'h ' + mins + 'm';
                }

                s -= mins * 60;
                return '' + mins + 'm ' + s + 's';
            },

            updateCell: function(store, rec) {
                var el = Ext.get('vmmap-' + rec.getId());
                if (el) {
                    el.down('div.name', true).innerHTML = rec.get('hostname');
                    el.down('div.mem', true).innerHTML = rec.get('memory');
                    el.down('span.uptime', true).innerHTML = this.getUptime(rec);
                    el.down('span.cores', true).innerHTML = rec.get('num_cores');
                    if (rec.get('state') === 'inactive') {
                        el.addCls('inactive');
                    } else {
                        el.removeCls('inactive');
                    }

                    var tags = rec.get('tags');
                    var usedTags = [];
                    Ext.each(tags, function(tag) {
                        var color = this.tagColors[tag];
                        var shortened = this.tagShortened[tag];
                        if (color) {
                            usedTags[usedTags.length] = {name: tag, color: color, tagShortened: shortened};
                        }
                    }, this);

                    var tagsEl = el.down('div.tags');
                    if (usedTags.length == 0) {
                        if (tagsEl) {
                            tagsEl.remove();
                        }
                        return;
                    }

                    if (!tagsEl) {
                        tagsEl = Ext.get(document.createElement("div"));
                        tagsEl.addCls('tags');
                        el.insertFirst(tagsEl);
                    }
                    tagsEl.update(this.tagTpl.apply(usedTags));
                }
            },

            updateCellEvent: function(store, rec, action) {
                if (action === 'edit') {
                    this.updateCell(store, rec);
                }
            },

            onResizeStart: function(e, el) {
                if (e.button != 0) {
                    return;
                }

                el = e.getTarget('div.resizer');
                if (!el) {
                    return;
                }

                this.resizingCell = el.parentNode.firstChild;
                this.originalWidth = parseInt(this.resizingCell.style.getPropertyValue('width'));
                this.resizeAnchor = [e.getX(), e.getY()];
                this.originalSize = parseInt(Ext.get(this.resizingCell).down('div.mem', true).innerHTML);
            },

            onResize: function(e, el) {
                if (!this.resizingCell) {
                    return;
                }
                var pos = e.getXY();
                var delta = [pos[0] - this.resizeAnchor[0], pos[1] - this.resizeAnchor[1]];
                this.resizingCell.style.setProperty('width', (Math.max(this.originalWidth + delta[0], 1)) + 'px');
                this.newSize = this.originalSize + delta[0];
                Ext.get(this.resizingCell).down('div.mem', true).innerHTML = this.newSize;
                e.stopEvent();
            },

            onResizeEnd: function(e, el) {
                var me = this;
                if (!this.resizingCell) {
                    return;
                }
                Ext.Msg.show({
                    title:'Resize',
                    msg: 'Resize VM from ' + this.originalSize +
                       ' MB to ' + this.newSize + 'MB?',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.QUESTION,
                    scope: me,
                    fn: function(buttonId) {
                        if (buttonId === 'no') {
                            Ext.get(this.resizingCell).child('div.mem', true).innerHTML = this.originalSize;
                            this.resizingCell.style.setProperty('width', (Math.max(this.originalWidth, 1)) + 'px');
                        } else {
                            var newSize = this.newSize;
                            Ext.getStore('ComputesStore').loadById(this.getIdFromEl(this.resizingCell),
                                function(compute) {
                                    compute.set('memory', newSize);
                                    compute.save({
                                        success: function(ret) {
                                            Onc.core.EventBus.fireEvent('displayNotification', 'Virtual Machine \'' +
                                                ret.get('hostname') + '\' successfully resized');
                                        },
                                        failure: function(response) {
                                            Onc.core.EventBus.fireEvent('displayNotification',
                                                'Error occurred while resizing Virtual Machine', 'error');
                                        }
                                    });
                                },
                                function(error) {
                                    Onc.core.EventBus.fireEvent('displayNotification',
                                        'Error occurred while resizing Virtual Machine', 'error');
                                }
                            );
                        }

                        this.vmmapTab.disableResizing();
                        delete this.resizingCell;
                        delete this.originalWidth;
                        delete this.resizeAnchor;
                        delete this.originalSize;
                        delete this.newSize;
                    }
                });
            },

            highlightTag: function(tag) {
                var tags = Ext.select('div.tag', false, this.el.dom);
                var i, len = tags.getCount();
                for (i = 0; i < len; i++) {
                    Ext.fly(tags.item(i)).up('div.node-cell').removeCls('tag-highlight');
                }

                if (this.isTagHighlighted) {
                    this.isTagHighlighted = false;
                    return;
                }

                tags = Ext.select('div.tag[title="' + tag + '"]', false, this.el.dom);
                len = tags.getCount();
                for (i = 0; i < len; i++) {
                    Ext.fly(tags.item(i)).up('div.node-cell').addCls('tag-highlight');
                }

                this.isTagHighlighted = true;
            },

            onMouseClick: function(e, el) {
                if (this.resizeMode) {
                    return;
                }

                el = e.getTarget('div.tag');
                if (el) {
                    this.highlightTag(el.title);
                    return;
                }

                el = e.getTarget('div.node-cell');
                el = Ext.get(el);
                if (!el) {
                    return;
                }

                if (e.shiftKey) {
                    var from = this.lastSelectedCell || this.el.down('div.node-cell');
                    var allCells = Ext.select('div.node-cell', true, this.el.dom);
                    var to = allCells.indexOf(el);

                    from = allCells.indexOf(from);
                    if (from > to) {
                        var temp = from;
                        from = to;
                        to = temp;
                    }

                    var i, item;
                    if (!e.ctrlKey) {
                        var count = allCells.getCount();
                        for (i = 0; i < count; i++) {
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

                if (ENABLE_VMMAP_TOOLBAR && ENABLE_VMMAP_TAG) {
                    var toolbar = this.getDockedComponent('toolbar');
                    var tagbtn = toolbar.getComponent('tag');
                    if (this.selection.getCount() > 0) {
                        tagbtn.enable();
                    } else {
                        tagbtn.disable();
                    }
                }
            },

            onMouseDoubleClick: function(e, el) {
                if (this.resizeMode || this.migrateMode) {
                    return;
                }

                el = e.getTarget('div.node-cell');
                el = Ext.get(el);
                if (el) {
                    this.fireEvent('showvmdetails', this.getIdFromEl(el));
                    return;
                }

                el = e.getTarget('tr.x-grid-row');
                if (el) {
                    if (e.getTarget('div.node-cell-free')) {
                        this.fireEvent('newvm', this.getView().getRecord(el));
                    } else {
                        this.fireEvent('showvmdetails', this.getView().getRecord(el).getId());
                    }
                }
            },

            getIdFromEl: function(el) {
                return el.id.substring(6); // remove 'vmmap-' from the beginning
            },

            getVmRecordFromEl: function(el) {
                return this.store.getById(this.getIdFromEl(el));
            }
        }];

        this.callParent(arguments);
    },

    afterRender: function() {
        this.vmmap = Ext.getCmp('vmmap');
        this.vmmap.vmmapTab = this;

        this.callParent(arguments);
    },

    updateAll: function() {
        var vmmap = this.vmmap;
        var store = vmmap.store;
        vmmap.getView().refresh();
    },

    onTagClick: function() {
        var cellList = "";
        this.vmmap.selection.each(function(id) {
            cellList += id + '<br>';
        });
        Ext.Msg.alert('Tag', cellList);
    },

    enableResizing: function() {
        var vmmap = this.vmmap;
        var vmmapEl = vmmap.getEl();

        vmmap.resizeMode = true;
        vmmap.getDockedComponent('toolbar').getComponent('resize').setText('Cancel Resize');

        var allCells = Ext.select('div.node-cell', true, this.el.dom);
        for (i = 0; i < allCells.getCount(); i++) {
            var cellEl = allCells.item(i);
            var cell = cellEl.dom;
            var cellStyle = cell.style;

            var width = Math.max(parseInt(cellStyle.getPropertyValue('min-width')), 1);
            cellStyle.removeProperty('min-width');
            cellStyle.setProperty('width', width + 'px');
            cellStyle.setProperty('overflow-x', 'hidden');

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

        this.mon(vmmapEl, 'mousedown', vmmap.onResizeStart, vmmap);
        this.mon(vmmapEl, 'mousemove', vmmap.onResize, vmmap);
        Ext.EventManager.on(document, 'mouseup', vmmap.onResizeEnd, vmmap);
    },

    disableResizing: function() {
        var vmmap = this.vmmap;
        var vmmapEl = vmmap.getEl();

        vmmap.resizeMode = false;
        vmmap.getDockedComponent('toolbar').getComponent('resize').setText('Resize');

        var resizers = Ext.select('div.resizer', true, vmmap.el.dom);
        for (i = 0; i < resizers.getCount(); i++) {
            var resizer = resizers.item(i);
            var resizeContainer = resizer.dom.parentNode;
            var cell = resizeContainer.firstChild;
            var cellStyle = cell.style;

            cellStyle.setProperty('min-width', cellStyle.getPropertyValue('width'));
            cellStyle.removeProperty('overflow-x');
            cellStyle.removeProperty('width');

            resizeContainer.removeChild(cell);
            resizeContainer.parentNode.insertBefore(cell, resizeContainer.nextSibling);
            resizeContainer.parentNode.removeChild(resizeContainer);
            resizer.remove();
        }

        this.mun(vmmapEl, 'mousedown', vmmap.onResizeStart, vmmap);
        this.mun(vmmapEl, 'mousemove', vmmap.onResize, vmmap);
        Ext.EventManager.un(document, 'mouseup', vmmap.onResizeEnd, vmmap);
    },

    onResizeClick: function(button) {
        if (this.vmmap.resizeMode) {
            this.disableResizing();
        } else {
            this.enableResizing();
        }
    },

    onMigrateClick: function(button) {
        this.migrateMode = !this.migrateMode;
        button.setText(this.migrateMode ? 'Cancel Migration' : 'Migrate');

        if (this.migrateMode) {
            this.dragZone = new Ext.dd.DragZone(this.getEl(), {
                getDragData: function(e) {
                    var nodeEl = e.getTarget('div.node-cell');
                    if (nodeEl) {
                        var vmmap = Ext.getCmp('vmmap');
                        var clone = nodeEl.cloneNode(true);
                        clone.id = Ext.id();
                        var sourceEl = Ext.fly(nodeEl).up('tr.x-grid-row');
                        var sourceRec = vmmap.getView().getRecord(sourceEl);
                        return {
                            ddel: clone,
                            nodeEl: nodeEl,
                            sourceRec: sourceRec,
                            repairXY: Ext.fly(nodeEl).getXY(),
                            dragSource: this,
                            vmmap: vmmap
                        }
                    }
                },

                getRepairXY: function() {
                    return this.dragData.repairXY;
                }
            });

            this.dropZone = new Ext.dd.DropZone(this.getEl(), {
                getTargetFromEvent: function(e) {
                    return e.getTarget('tr.x-grid-row');
                },

                onNodeOver: function(target, dd, e, data) {
                    var targetRec = data.vmmap.getView().getRecord(e.getTarget('tr.x-grid-row'));
                    if (targetRec) {
                        if (targetRec.getId() !== data.sourceRec.getId()) {
                            return Ext.dd.DropZone.prototype.dropAllowed;
                        }
                    }
                    return Ext.dd.DropZone.prototype.dropNotAllowed;
                },

                onNodeDrop: function(target, dd, e, data) {

                    var vmmap = data.vmmap;
                    var targetRec = vmmap.getView().getRecord(target);
                    var nodeName = Ext.get(data.nodeEl.id).down('div.name', true).innerHTML;
                    var computeId = data.nodeEl.id.replace('vmmap-', '');
                    var machineId = targetRec.id.replace('Onc.model.Compute-', '');
                    options = {computeId:computeId, machineId:machineId, srcHost:data.sourceRec.get('hostname'), destHost:targetRec.get('hostname'), nodeName:nodeName, vmmap:data.vmmap}
                    Onc.core.EventBus.fireEvent("startMigrate", options);
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
