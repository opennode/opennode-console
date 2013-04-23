Ext.define('Onc.store.RegisteredNodesStore', {
    extend: 'Onc.store.NodesStore',
    model: 'Onc.model.ManagedNode',

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },

        extraParams: {
            'depth': 1,
            'exclude': 'incoming,templates,consoles,routes,interfaces',
            'attrs': 'id,hostname,state,blacklisted_for_allocation',
        },
        url: '/machines'
    }
});
