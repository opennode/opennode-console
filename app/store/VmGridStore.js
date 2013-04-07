Ext.define('Onc.store.VmGridStore', {
    extend: 'Onc.core.Store',
    model: 'Onc.model.Compute',
    autoLoad: true,
    closable:true,
    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },
        extraParams: {
            'depth': 1,
            'attrs': 'virt,state,hostname,ipv4_address,cpu_info,url,num_cores,swap_size,diskspace,memory,suspicious,tags',
        },
        limitParam: null,
        pageParam: null,
        startParam: null,
        url: 'computes'
    },
    // This does not work on filtered grid
    // filters: [{
    // property: 'id',
    // value: /[^openvz]/
    // }],
    //    
    listeners: {
        load: function(store, records, successful, eOpts) {
            // remove manually unwanted record, filtering does not work on filtered grid
            store.remove(store.findRecord("id", "openvz"));
        }
    },
});
