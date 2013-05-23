Ext.define('Onc.store.SearchResultsStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.SearchResult',

    filters: [{
        filterFn: function(item) {
        	var features = item.get('features');
        	if(!Onc.model.AuthenticatedUser.isAdmin() && !Ext.Array.contains(features, 'IVirtualCompute')) 
        		return false;
            return !Ext.Array.contains(features, 'IUndeployed');
        }
    }]

});
