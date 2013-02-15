Ext.define('Onc.controller.SearchController', {
    extend: 'Ext.app.Controller',

    models: [/*'Base', 'Compute',*/ 'SearchResult'],
    stores: [/*'ComputesStore', 'PhysicalComputesStore',*/ 'SearchResultsStore'],
    views: ['SearchResultsView'],

    refs: [{ref: 'searchResults', selector: '#search-results'}],

    busListeners: {
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
