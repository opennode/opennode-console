Ext.define('Onc.ui.components.CPUGauge', {
    extend: 'Onc.ui.components.ComputeGauge',
    alias: 'widget.cpugauge',

    display: ['fixed', 2],


    initComponent: function(){
        this.metricsSubscriptionUrl = this.compute.get('url') + 'metrics/cpu_usage';

        if(this.initialConfig.max === undefined)
            this.max = this.compute.getMaxCpuLoad();
        if(this.initialConfig.value === undefined)
            this.setValue(this.compute.get('cpu_usage'));

        this.callParent();
    },
});
