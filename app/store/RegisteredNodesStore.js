Ext.define('Onc.store.RegisteredNodesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.ManagedNode',

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },

        extraParams: {
            'depth': 2
        },
        url: '/machines/by-name'
    }
});
