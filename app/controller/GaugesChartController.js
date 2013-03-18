Ext.define('Onc.controller.GaugesChartController', {
    extend: 'Ext.app.Controller',

    views: ['compute.GaugesChartView'],
    stores: ['ComputesStore'],

    refs: [{
        ref: 'window',
        selector: 'window.gaugeschart'
    }],

    busListeners: {
        displayGaugeChartDialog: function(compute) {
            this.getView('compute.GaugesChartView').create({
                compute: compute,
                store: Ext.create('Ext.data.JsonStore', {
                    fields: ['timestamp', 'cpu', 'memory', 'diskspace', 'network'],
                    data: [],
                    sorters: ['timestamp']
                }),
            }).show();
        }
    },

    init: function() {
    }
});
