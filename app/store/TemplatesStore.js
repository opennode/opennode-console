Ext.define('Onc.store.TemplatesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Template',

    sorters: [{
        property: 'name',
        transform: function(val) {
            return val.toLowerCase();
        }
    }],

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },
        url: 'templates/'
    }
});
