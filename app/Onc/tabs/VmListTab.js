Ext.define('Onc.tabs.VmListTab', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.computevmlisttab',

    layout: 'fit',

    _cellComponentMap: null,   // map of reusable components
    _cellContainerMap: null,   // map of containers

    title: "Virtual Machines",
    forceFit: true,
    multiSelect: true,
    header: false,
    border: false,

    viewConfig: {
        getRowClass: function(record) {
            return 'compute state-' + record.get('state');
        }
    },


    initComponent: function() {
        this.addEvents('groupStop', 'groupStart');

        // initialize component and subscription cache
        this._cellComponentMap = {};
        this._cellContainerMap = {};

        this.store = this.record.getChild('vms').children();
        this.tbar = this._createTbarButtons();
        this.columns = [
            {header: 'State', xtype: 'templatecolumn', tpl: '<div class="state-icon" title="{state}"></div>', width: 40},
            {header: 'Name', dataIndex: 'hostname', width: 75, editor: {xtype: 'textfield', allowBlank: false}},
            {header: 'Inet4', dataIndex: 'ipv4_address', editor: {xtype: 'textfield', allowBlank: true}},
            {header: 'Inet6', dataIndex: 'ipv6_address', editor: {xtype: 'textfield', allowBlank: true}},

            {header: 'actions', renderer:
                makeColumnRenderer(this._computeStateRenderer.bind(this))
            },

            this._makeGaugeColumn('CPU usage', 'cpu'),
            this._makeGaugeColumn('Memory usage', 'memory', 'MB'),
            this._makeGaugeColumn('Disk usage', 'diskspace', 'MB'),

            {header: 'ID', dataIndex: 'id', width: 130, hidden: true}
        ];

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
                        var selectedItems = this.getSelectionModel().getSelection();
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

    _computeStateRenderer: function(domId, _, _, vmRec) {
        var csKey = 'computestate-' + vmRec.get('id');
        this._addToContainer(csKey, domId, function(){
            return Ext.widget('computestatecontrol', {
                compute: vmRec,
                // fixed layout needed because of ExtJs-4.1 rendering mechanism 
                defaults: {
                    width: 38,
                    height: 38
                }
            });
        }.bind(this));
    },

    _makeGaugeColumn: function(label, name, unit) {
        return {
            header: label,
            width: 85,
            align: 'center',
            dataIndex: 'id',
            renderer: makeColumnRenderer(function(domId, _, _, rec) {
                var gaugeKey = 'gauge-' + rec.get('id') + '-' + label;
                this._addToContainer(gaugeKey, domId, function(){
                    return  this._createGauge(label, name, unit, rec);
                }.bind(this));
            }.bind(this))
        };
    },

    _createGauge: function(label, name, unit, rec){
        if(name === 'memory')
            return Ext.create('Onc.ui.components.MemoryGauge', {
                border: false,
                compute: rec,
                unit: 'MB',
            });
        else if(name === 'cpu')
            return Ext.create('Onc.ui.components.CPUGauge', {
                border: false,
                compute: rec,
            });
        else if(name === 'diskspace')
            return Ext.create('Onc.ui.components.DiskGauge', {
                border: false,
                compute: rec,
                metricsSubscriptionUrl: null,
                unit: 'MB'
            });
    },

    _addToContainer: function(componentKey, domId, componentFactory){
        // retrieve existing component, or create if one does not exists
        var cellComponent = this._cellComponentMap[componentKey];
        if(!cellComponent){
            cellComponent = componentFactory();
            this._cellComponentMap[componentKey] = cellComponent;
        }

        // create new container and add component
        var cellContainer = Ext.create('Ext.container.Container', {
            renderTo: domId
        });
        cellContainer.add(cellComponent);

        // destroy previous gauge container
        this._destroyCellContainer(componentKey);

        // memorize current gauge container
        this._cellContainerMap[componentKey] = cellContainer;
    },


    // destroys container and component cache
    onDestroy: function(){
        // containers
        for(var containerKey in this._cellContainerMap){
            this._destroyCellContainer(containerKey);
        }
        delete this._cellContainerMap;

        // components
        for(var componentKey in this._cellComponentMap){
            this._cellComponentMap[componentKey].destroy();
        }
        delete this._cellComponentMap;
    },

    _destroyCellContainer: function(containerKey){
        var oldGaugeContainer = this._cellContainerMap[containerKey];
        if(oldGaugeContainer){
            oldGaugeContainer.removeAll();
            oldGaugeContainer.destroy();
            delete oldGaugeContainer;
        }
    }
});
