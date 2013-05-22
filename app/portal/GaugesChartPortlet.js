Ext.define('Onc.portal.GaugesChartPortlet', {

    extend: 'Ext.panel.Panel',
    alias: 'widget.gaugeschartportlet',

    layout: 'fit',
    border: false,
    
    getChart:function(){
        return Ext.getCmp("portletsGaugesChart");
    },
    
    initComponent: function() {
        this.items = [{
            xtype: 'gaugechart',
            id: 'portletsGaugesChart',
            usePercentValues:false
        }];

        this.tbar = [{
            text: 'Clear',
            handler: function() {
                this.getChart().clearData();
            }.bind(this)
        }, {
            text: 'Old Data',
            handler: function() {
                this.getChart().loadOldData();
            }.bind(this)
        }, {
            id: 'gauges_chart_computes',
            name: 'gauges_chart_computes',
            fieldLabel: '',
            xtype: 'combo',
            queryMode: 'local',
            triggerAction: 'all',
            editable: false,
            displayField: 'hostname',
            valueField: 'id',

            multiSelect: true,
            store: Ext.getStore("GaugesChartComputesStore").load({
                scope: this,
                callback: function(records, operation, success) {
                    if (success) {
                        if (records.length > 0) {
                            var firstRecord = records[0];
                            if (firstRecord){
                            	var cmp = Ext.getCmp("gauges_chart_computes");
                            	if(cmp) cmp.select(firstRecord)
                            } 
                        }
                    }
                }
            }),
            listeners: {
                change: function(combo, newValue, oldValue, eOpts) {
                    var computes = [];
                    for ( var i = 0; i < newValue.length; i++) {
                        var compute = Ext.getStore("GaugesChartComputesStore").getById(newValue[i]);
                        if (!compute)
                            console.error("No Compute found by id:" + newValue[i]);
                        else
                            computes.push(compute);
                    }
                    
                    this.getChart().setAndLoadComputes(computes)
                }.bind(this)
            }
        }, {
            xtype: "buttongroup",
            columns: 4,
            id: "metrictype",
            defaults: {
                enableToggle: true,
                scale: 'small',
                handler: function(btn) {
                    if (Ext.ComponentQuery.query('#metrictype [pressed=true]').length > 0) {// always one selected
                        if (btn.pressed)
                            this.getChart().addMetric(btn.value);
                        else
                            this.getChart().removeMetric(btn.value);
                    } else {
                        btn.toggle(true, true);
                    }
                }.bind(this),
                listeners: {
                    afterrender: function(btn) {
                        if (this.getChart().selectedMetrics.indexOf(btn.value) !== -1) btn.toggle(true, false);
                    }.bind(this)
                }
            },
            items: [{
                text: "CPU",
                value: "cpu"
            }, {
                text: "Disc",
                value: "diskspace"
            }, {
                text: "RAM",
                value: "memory"
            }, {
                text: "NET",
                value: "network"
            }]
        }];
        this.callParent(arguments);
    }

});
