Ext.define('Onc.store.SearchResultsStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.SearchResult',

    proxy: {
        type: 'rest',
        reader: {
            type: 'json',
            root: 'children'
        },
        url: Onc.Backend.url('search/?depth=1')
    }
});
