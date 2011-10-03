Ext.define('opennodeconsole.view.compute.View', {
    extend: 'Ext.Container',
    alias: 'widget.computeview',

    iconCls: 'icon-mainframe',
    layout: {type: 'vbox', align: 'stretch'},

    initComponent: function() {
        var rec = this.record;

        this.title = rec.get('hostname');
        this.tabConfig = {
            tooltip: (rec.get('hostname') + '<br/>' +
                      rec.get('ip_address') + '<br/>' +
                      rec.get('type'))
        };

        this.items = [{
            xtype: 'computeinfo',
            record: rec
        }, {
            flex: 1,
            xtype: 'tabpanel',
            activeTab: 0,
            defaults: {record: rec},
            items: [{
                title: 'Status',
                xtype: 'computestatustab'
            }, {
                title: 'System',
                xtype: 'computesystemtab',
                iconCls: 'icon-mainframe'
            }, {
                title: 'Network',
                iconCls: 'icon-network'
                // xtype: 'computenetworktab'
            }, {
                title: 'Storage',
                iconCls: 'icon-hd'
                // html: 'computestoragetab'
            }, {
                title: 'Templates',
                // html: 'computetemplatestab'
            }]
        }];

        this.callParent(arguments);
    }
});


Ext.define('opennodeconsole.view.compute.Info', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.computeinfo',

    frame: true,
    height: 50,
    bodyPadding: 5,

    layout: {type: 'hbox', align: 'middle'},

    initComponent: function() {
        var rec = this.record;

        this.defaults = {
            xtype: 'gauge',
            margin: '0 5px',
            width: 160
        };
        this.items = [
            {label: 'CPU', value: 0, iconCls: 'icon-cpu'},
            {label: 'MEM', value: 0, max: rec.get('memory'), unit: 'MB'},
            {label: 'NET', value: 0, iconCls: 'icon-network', max: rec.get('network'), unit: 'Mbs'},
            {label: 'DISK', value: 0, iconCls: 'icon-hd', max: rec.get('diskspace'), unit: 'GB'}
        ];

        // TODO: Replace this with actual data from the server.
        // Feed the CPU and NET gauges with random values for demonstration purposes:
        var me = this;
        this._randomDataInterval = setInterval(function() {
            ['CPU', 'NET'].forEach(function(gaugeName) {
                var gauge = me.child('gauge[label=' + gaugeName + ']');
                var d = gauge.max * Math.random() * 0.1;
                gauge.setValue(Math.max(0, Math.min(gauge.max, gauge.value + (Math.random() < 0.5 ? +d : -d))));
            });
        }, 500);

        this.callParent(arguments);
    },

    onRender: function() {
        var rec = this.record;

        this.callParent(arguments);
        // TODO: Replace this with actual data from the server.
        // Initialise the gauges to random values for demonstration purposes:
        this.child('gauge[label=CPU]').setValue(Math.random());
        this.child('gauge[label=MEM]').setValue(Math.random() * rec.get('memory'));
        this.child('gauge[label=NET]').setValue(Math.random() * rec.get('network'));
        this.child('gauge[label=DISK]').setValue(Math.random() * rec.get('diskspace'));
    },

    onDestroy: function() {
        this.callParent(arguments);
        clearInterval(this._randomDataInterval);
        delete this._randomDataInterval;
    }
});


Ext.define('opennodeconsole.view.compute.Tab', {
    extend: 'Ext.panel.Panel',
    frame: true,
    bodyPadding: 5
});


Ext.define('opennodeconsole.view.compute.StatusTab', {
    extend: 'opennodeconsole.view.compute.Tab',
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

        tbarButtons.splice(3, 0, {xtype: 'tbseparator'});

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
                    var domId = 'compute-' + rec.get('id') + '-vm-gauge-' + name + '-' + vmId;
                    setTimeout(function() {
                        var gauge = Ext.create('opennodeconsole.widgets.Gauge', {
                            renderTo: domId,
                            label: label
                        });
                    }, 0);
                    return '<div id="' + domId + '"></div>';
                }
            };
        }

        this.items = [{
            xtype: 'gridpanel',
            title: "Virtual Machines",
            multiSelect: true,

            store: rec.vms(),

            viewConfig: {
                getRowClass: function(record) {
                    return 'compute state-' + record.get('state');
                }
            },

            tbar: tbarButtons,

            columns: [
                {header: 'ID', dataIndex: 'id', width: 45},
                {header: 'State', xtype: 'templatecolumn', tpl: '<div class="state-icon" title="{state}"></div>', width: 40},
                {header: 'Name', dataIndex: 'hostname'},
                {header: 'IP Address', dataIndex: 'ip_address'},

                _makeGaugeColumn('CPU usage', 'cpuUsage'),
                _makeGaugeColumn('Memory usage', 'memUsage'),
                _makeGaugeColumn('Disk usage', 'diskUsage'),

                {xtype: 'actioncolumn', hideable: false, sortable: false, width: 4 * (32 + 2), items: rowActions}
            ]
        }];

        this.callParent(arguments);
    }
});


Ext.define('opennodeconsole.view.compute.SystemTab', {
    extend: 'opennodeconsole.view.compute.Tab',
    alias: 'widget.computesystemtab',

    initComponent: function() {
        var rec = this.record;

        this.items = [{
            layout: {type: 'table', columns: 2},
            frame: true,
            margin: '0 0 10px 0',
            defaults: {
                xtype: 'box',
                padding: 5
            },
            items: [{html: 'CPU info'}, {style: "font-weight: bold", html: rec.get('cpu')},
                    {html: 'Memory'}, {style: "font-weight: bold", html: rec.get('memory') + 'MB'},
                    {html: 'OS Release'}, {style: "font-weight: bold", html: rec.get('os_release')},
                    {html: 'Kernel'}, {style: "font-weight: bold", html: rec.get('kernel')},
                    {html: 'Uptime'}, {itemId: 'uptime', style: "font-weight: bold", html: rec.getUptime()}]
        }, {
            layout: {type: 'table', columns: 2},
            frame: true,
            defaults: {
                xtype: 'gauge',
                width: 250,
                margin: 10
            },
            items: [{label: 'CPU Usage', value: 0},
                    {label: 'HD Space (Root Partition)', value: 0, max: rec.get('diskspace_rootpartition'), unit: 'MB'},

                    {label: 'IO Delays', value: 0},
                    {label: 'HD Space (Storage Partition)', value: 0, max: rec.get('diskspace_storagepartition'), unit: 'GB'},

                    {label: 'Physical Memory', value: 0, max: rec.get('memory'), unit: 'MB'},
                    {label: 'HD Space (VZ Partition)', value: 0, max: rec.get('diskspace_vzpartition'), unit: 'GB'},

                    {label: 'Swap Space', value: 0, max: rec.get('swap_size'), unit: 'MB'},
                    {label: 'HD Space (Backup Partition)', value: 0, max: rec.get('diskspace_backuppartition'), unit: 'GB'},

                    {label: 'Network Usage', value: 0, max: rec.get('network'), unit: 'Mbps'}]
        }];

        var me = this;
        this._uptimeUpdateInterval = setInterval(function() {
            me.down('#uptime').update('' + rec.getUptime());
        }, 1000);

        this.callParent(arguments);
    },

    onDestroy: function() {
        this.callParent(arguments);
        clearInterval(this._uptimeUpdateInterval);
        delete this._uptimeUpdateInterval;
    }
});


Ext.define('opennodeconsole.widgets.Gauge', {
    extend: 'Ext.Component',
    alias: 'widget.gauge',
    cls: 'gauge',
    iconCls: null,

    width: 125,

    value: 0.0,
    max: 1.0,
    unit: null,
    criticalLevel: 0,
    criticalCurve: 5,

    tpl: new Ext.XTemplate(
        '<span>',
        '    <label>{label}</label> ',
        '    <span class="value"></span>%',
        '    <tpl if="unit"> of {max}{unit}</tpl>',
        '</span>',
        '<div class="bar"><div></div></div>'
    ),

    onRender: function() {
        this.callParent(arguments);
        this.tpl.overwrite(this.el, this);
        if (this.iconCls) {
            this.el.addCls(this.iconCls);
            this.el.addCls('with-icon');
        }
    },

    afterRender: function() {
        this.callParent(arguments);
        this.refresh();
    },

    setValue: function(value) {
        this.value = value;
        this.refresh();
    },

    refresh: function() {
        if (this.rendered) {
            var ratio = Math.round(this.value / this.max * 100);
            this.el.down('.value').update('' + ratio);
            this.el.down('.bar div').setWidth('' + ratio + '%');

            var redMax = 100 - this.criticalLevel;
            var redLevel = ratio - this.criticalLevel;
            if (redLevel > 0) {
                var redFactor = Math.pow(redLevel / redMax, this.criticalCurve) * 255;
                var color = new Ext.draw.Color(redFactor, 0, 255 - redFactor);
                this.el.down('.bar div').applyStyles({'background-color': color});
            }
        }
    }
});
