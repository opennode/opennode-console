Ext.define('Onc.core.ui.components.MemoryGauge', {
    extend: 'Onc.core.ui.components.ComputeGauge',
    alias: 'widget.memorygauge',

    initComponent: function(){
        this.metricsSubscriptionUrl = this.compute.get('url') + 'metrics/memory_usage';
        this.computeSubscriptionUrl = this.compute.get('url');

        if(this.initialConfig.max === undefined)
            this.max = this.compute.get('memory');
        if(this.initialConfig.value === undefined)
            this.setValue(this.compute.get('memory_usage'));

        this.callParent();
    },

    onComputeData: function(data){
        var name = data[this.computeSubscriptionUrl].name;
        if(name === 'memory'){
            var val = data[this.computeSubscriptionUrl].value;
            this.max = val;
        }
    }

});
