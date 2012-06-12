Ext.define('Onc.store.IncomingNodesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.ManagedNode',

    proxy: {
        type: 'onc',
        reader: 'json',
        url: '/machine/incoming'
    }
});
