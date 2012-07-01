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
            'exclude': 'incoming',
            'depth': 3
        },

        url: 'machines/'
    }
});

