Ext.define('Onc.store.PhysicalComputesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Compute',

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },

        extraParams: {
            'exclude': 'incoming,templates,consoles,routes,interfaces',
            'attrs': '__type__,hostname,diskspace,memory,num_cores,state,tags,uptime,url,children,backend',
            'depth': 3
        },

        url: 'machines/'
    }
});

