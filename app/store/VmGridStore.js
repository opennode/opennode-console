Ext.define('Onc.store.VmGridStore', {
    extend: 'Onc.core.Store',
    model: 'Onc.model.Compute',
    pageSize: 10,
    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children',
            totalProperty: 'totalChildren'
        },
        extraParams: {
            'depth': 1,
            'attrs': 'state,hostname,ipv4_address,cpu_info,url,num_cores,swap_size,diskspace,memory,suspicious,tags,features',
            'exclude': 'openvz'
        },
        limitParam: 'limit',
        pageParam: 'offset',
        startParam: null,
        url: 'computes'
    },

});
