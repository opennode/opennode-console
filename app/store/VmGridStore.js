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
            'attrs': 'id,url,tags,architecture,cpu_info,os_release,kernel,template,hostname,ipv4_address,ipv6_address,state,effective_state,num_cores,memory,diskspace,network,swap_size,uptime,suspicious,features',
        },
        limitParam: 'limit',
        pageParam: 'offset',
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
