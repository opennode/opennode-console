Ext.define('Onc.store.ComputesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Compute',

    autoLoad: true,

    proxy: {
        type: 'rest',
        reader: {
            type: 'json',
            root: 'children'
        },
        api: {
            read: BACKEND_PREFIX + 'computes/?depth=3',
            create: BACKEND_PREFIX + 'computes',
        }
    }
});
