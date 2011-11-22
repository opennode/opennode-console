Ext.define('Onc.store.SearchResultsStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.SearchResult',

    proxy: {
        type: 'rest',
        reader: {
            type: 'json',
            root: 'children'
        },
        url: BACKEND_PREFIX + 'search/?depth=1'
    }
});
