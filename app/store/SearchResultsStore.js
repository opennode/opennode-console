Ext.define('Onc.store.SearchResultsStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.SearchResult',

    filters: [{
        filterFn: function(item) {
            return !Ext.Array.contains(item.get('features'), 'IUndeployed');
        }
    }]

});
