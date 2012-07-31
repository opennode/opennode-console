Ext.define('Onc.core.ui.components.ComputeGauge', {
    extend: 'Onc.core.ui.widgets.Gauge',
    alias: 'widget.computegauge',

    compute: null,
    computeSubscriptionUrl: null,
    metricsSubscriptionUrl: null,
    dynamic: true,

    _subscriptions: null,  // array of gauge subscriptions


    initComponent: function() {
        this._subscriptions = [];

        if(this.dynamic && this.metricsSubscriptionUrl){
            this._subscribe(this.metricsSubscriptionUrl, this.onMetricsData);
        }

        if(this.dynamic && this.computeSubscriptionUrl){
            this._subscribe(this.computeSubscriptionUrl, this.onComputeData);
        }

        this.callParent();
    },

    onRender: function() {
        this.callParent(arguments);
        this._checkIfActive();
    },

    onDestroy: function(){
        this._unsubscribe();
    },


    onMetricsData: function(data){
        this.setValue(data[this.metricsSubscriptionUrl]);
    },

    onComputeData: function(data){},

    _subscribe: function(url, listener){
//        console.log('+ subscribe: ' + this.compute.get('hostname'));
        var subscription = Onc.core.hub.Hub.subscribe(listener.bind(this), [url], 'gauge', this._checkIfActive.bind(this));
        this._subscriptions.push(subscription);
    },

    _unsubscribe: function(){
        Ext.Array.each(this._subscriptions, function(item){
//            console.log('- unsubscribe: ' + this.compute.get('hostname'));
            item.unsubscribe();
        }, this);
        this._subscriptions = null;
    },

    _checkIfActive: function() {
        var active = this.compute.get('state') == 'active';
        if (!active){
            this.setValue(0);
            // TODO: check if null check is necessary 
            if(this.getEl())
                this.getEl().addCls('gauge-disabled');
        } else {
            if(this.getEl())
                this.getEl().removeCls('gauge-disabled');
        }
        // TODO: also change here widget active/inactive class if we want different visualization
        return active;
    }
});
