Ext.define('opennodeconsole.store.Computes', {
    extend: 'Ext.data.Store',
    model: 'opennodeconsole.model.Compute',

    autoLoad: true,

    proxy: {
        type: 'rest',
        reader: {
            type: 'json',
            root: 'children'
        },
        url: BACKEND_PREFIX + 'computes/?depth=1'
    }
});
