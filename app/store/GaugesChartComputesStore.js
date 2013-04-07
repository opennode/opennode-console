Ext.define('Onc.store.GaugesChartComputesStore', {
    storeId:'GaugesChartComputesStore',
    extend: 'Ext.data.Store',
    model: 'Onc.model.Compute',

    autoLoad: true,


    sorters: [{
        property: 'hostname',
        transform: function(val) {
            return val.toLowerCase();
        }
    }],

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },
        extraParams: {
            'depth': 1,
            'attrs': 'hostname,url,network,num_cores,swap_size,diskspace,memory',
          //  'q': 'virt:no'
        },
        limitParam: null,
        pageParam: null,
        startParam: null,
        url: 'computes'
    }

});
