Ext.define('Onc.store.SearchResultsStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.SearchResult',
    
    filters: [{
        property: 'id',
        value: /[^openvz]/
    }],
});
