Ext.define('Onc.store.TemplatesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Template',

    autoLoad: true,

    proxy: {
        type: 'rest',
        reader: 'json',
        url: BACKEND_PREFIX + 'templates/'
    }
});
