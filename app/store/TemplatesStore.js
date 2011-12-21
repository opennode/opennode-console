Ext.define('Onc.store.TemplatesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Template',

    proxy: {
        type: 'onc',
        reader: 'json',
        url: 'templates/'
    }
});
