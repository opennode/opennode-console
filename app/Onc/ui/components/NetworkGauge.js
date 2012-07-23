Ext.define('Onc.ui.components.NetworkGauge', {
    extend: 'Onc.ui.components.ComputeGauge',
    alias: 'widget.networkgauge',

    display: ['fixed', 2],


    initComponent: function(){
        this.metricsSubscriptionUrl = this.compute.get('url') + 'metrics/network_usage';

        if(this.initialConfig.max === undefined)
            this.max = this.compute.get('network');
        if(this.initialConfig.value === undefined)
            this.setValue(this.compute.get('network_usage'));

        this.callParent();
    },

    onMetricsData: function(data){
        this.setValue(data[this.metricsSubscriptionUrl]);
    },

});
