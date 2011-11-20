Ext.define('opennodeconsole.controller.MainController', {
    extend: 'Ext.app.Controller',

    models: ['Base', 'Compute', 'VirtualBridge', 'IpRoute', 'Storage', 'Template', 'VirtualizationContainer', 'Hangar', 'Templates'],
    stores: ['ComputesStore', 'TemplatesStore'],
    views: ['SearchResultsView', 'compute.ComputeView'],

    refs: [{ref: 'searchResults', selector: '#search-results'},
           {ref: 'tabs', selector: '#mainTabs'}],

    init: function() {
        this.control({
            '#search-results': {
                selectionchange: function(view, selections, options) {
                    if (selections.length === 0)
                        return;

                    var selection = selections[0];
                    var computeId = selection.get('id');

                    var tabPanel = this.getTabs();
                    var tab = tabPanel.child('computeview[computeId=' + computeId + ']');
                    if (!tab) {
                        tab = Ext.widget('computeview', {
                            record: selection,
                            computeId: computeId
                        });
                        tabPanel.add(tab);
                    }
                    tabPanel.setActiveTab(tab);
                }
            },
            '#search-filter': {
                'changed': function(keywords) {
                    this.getSearchResults().applyFilter(keywords);
                }
            },
            '#mainTabs': {
                tabchange: function(tabPanel, newTab) {
                    var computeId = newTab.computeId;
                    var searchResults = this.getSearchResults();
                    var store = searchResults.getStore();
                    var selModel = searchResults.getSelectionModel();
                    if (searchResults.getStore().getById(computeId))
                        selModel.select(store.getById(computeId));
                    else
                        selModel.deselect(selModel.getSelection());
                }
            }
        });
    }
});
