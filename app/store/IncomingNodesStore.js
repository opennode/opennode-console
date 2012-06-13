Ext.define('Onc.store.IncomingNodesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.ManagedNode',

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },

        extraParams: {
            'depth': 3
        },
        url: '/machines/incoming'
    }
});
