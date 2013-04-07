Ext.define('Onc.view.tabs.VmListGridTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computevmlistgridtab',

    layout: 'fit',
    closable: true,

    initComponent: function() {
        this.items = [{
            xtype: 'computevmlisttab',
            id: 'vmgrid',
            store: "VmGridStore",
            tbar: [{
                text: 'Only running',
                tooltip: 'Show only running',
                enableToggle: true,
                handler: function(button, state) {
                    var onlyRunning = (button.pressed !== false);
                    var grid = Ext.getCmp("vmgrid");
                    var gridFilter = grid.filters.getFilter("state");

                    if (onlyRunning) gridFilter.setValue("active");
                    gridFilter.setActive(onlyRunning, true);
                    grid.filters.reload();
                }
            }, {
                text: 'Local Filtering',
                tooltip: 'Toggle Filtering between remote/local',
                enableToggle: true,
                handler: function(button, state) {
                    var grid = Ext.getCmp("vmgrid");
                    var local = (grid.filters.local !== true);
                    // update the GridFilter setting
                    grid.filters.local = local;
                    grid.filters.reload();
                }
            }, {
                text: 'Clear Filter Data',
                handler: function() {
                    var grid = Ext.getCmp("vmgrid");
                    grid.filters.clearFilters();
                }
            }, ],
            dockedItems: [Ext.create('Ext.toolbar.Paging', {
                dock: 'bottom',
                store: "VmGridStore"
            })],

        }];

        this.callParent(arguments);
    }

});
