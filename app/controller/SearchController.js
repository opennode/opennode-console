Ext.define('Onc.controller.SearchController', {
    extend: 'Ext.app.Controller',

    models: [/*'Base', 'Compute',*/ 'SearchResult'],
    stores: [/*'ComputesStore', 'PhysicalComputesStore',*/ 'SearchResultsStore'],
    views: ['SearchResultsView'],

    refs: [{ref: 'searchResults', selector: '#search-results'}],

    busListeners: {
        // when compute is opened in tab, select it in list
        computeDisplayed: function(computeId){
            var searchResults = this.getSearchResults();
            var store = searchResults.getStore();
            var selModel = searchResults.getSelectionModel();
            if (searchResults.getStore().getById(computeId))
                selModel.select(store.getById(computeId));
            else
                selModel.deselect(selModel.getSelection());
        }
    },

    init: function() {
        this.control({
            '#search-results': {
                selectionchange: function(view, selections, options) {
                    if (selections.length === 0)
                        return;
                    var selection = selections[0];
                    var computeId = selection.get('id');
                    this.fireBusEvent('openCompute', computeId);
                }
            },
            '#search-filter': {
                'changed': function(keywords) {
                    this.getSearchResults().applyFilter(keywords);
                }
            }
        });
    }
});
