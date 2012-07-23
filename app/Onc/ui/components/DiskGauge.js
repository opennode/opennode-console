Ext.define('Onc.ui.components.DiskGauge', {
    extend: 'Onc.ui.components.ComputeGauge',
    alias: 'widget.diskgauge',

    partition: 'total',


    initComponent: function(){
        this.metricsSubscriptionUrl = this.compute.get('url') + 'metrics/diskspace_usage';

        if(this.initialConfig.max === undefined)
            this.max = this.compute.get('diskspace')[this.partition];
        if(this.initialConfig.value === undefined)
            this.setValue(this.compute.get('diskspace_usage')[this.partition]);;

        this.callParent();
    },

    onMetricsData: function(data){
        this.setValue(data[this.metricsSubscriptionUrl]);
    }

});
