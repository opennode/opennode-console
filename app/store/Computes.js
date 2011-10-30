Ext.define('opennodeconsole.store.Computes', {
    extend: 'Ext.data.Store',
    model: 'opennodeconsole.model.Compute',

    autoLoad: true,

    proxy: {
        type: 'rest',
        reader: 'json',
        url: BACKEND_PREFIX + 'computes/'
    }
});
