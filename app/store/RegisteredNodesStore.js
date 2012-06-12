Ext.define('Onc.store.RegisteredNodesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.ManagedNode',

    proxy: {
        type: 'onc',
        reader: 'json',
        url: '/machine/by-name'
    }
});
