Ext.define('opennodeconsole.store.TemplatesStore', {
    extend: 'Ext.data.Store',
    model: 'opennodeconsole.model.Template',

    autoLoad: true,

    proxy: {
        type: 'rest',
        reader: 'json',
        url: BACKEND_PREFIX + 'templates/'
    }
});
