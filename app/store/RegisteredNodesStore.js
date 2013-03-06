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
            'depth': 2,
            'exclude': 'incoming'
        },
        url: '/machines'
    }
});
