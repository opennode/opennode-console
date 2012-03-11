Ext.define('Onc.controller.MainController', {
    extend: 'Ext.app.Controller',

    models: ['Base', 'Compute', 'IpRoute', 'Storage', 'Template', 'VirtualizationContainer', 'Hangar',
             'Templates', 'SearchResult', 'NetworkInterface', 'NetworkInterfaces'],
    stores: ['ComputesStore', 'TemplatesStore', 'SearchResultsStore'],
    views: ['SearchResultsView', 'compute.ComputeView', 'compute.NewVmView', 'Onc.view.VmMapView'],

    refs: [{ref: 'searchResults', selector: '#search-results'},
           {ref: 'tabs', selector: '#mainTabs'}],

    openComputeInTab: function(computeId, _compute) {
        var tabPanel = this.getTabs();
        var tab = tabPanel.child('computeview[computeId=' + computeId + ']');
        if (!tab) {
            if (!_compute)
                _compute = this.getStore('ComputesStore').getById(computeId);
            tab = Ext.widget('computeview', {
                record: _compute,
                computeId: computeId
            });
            tabPanel.add(tab);
        }
        tabPanel.setActiveTab(tab);
    },

    init: function() {
        this.control({
            '#search-results': {
                // TODO: Use a custom event instead
                selectionchange: function(view, selections, options) {
                    if (selections.length === 0)
                        return;

                    var selection = selections[0];
                    var computeId = selection.get('id');

                    this.openComputeInTab(computeId, selection);
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
            },
            '#vmmap': {
                showvmdetails: function(computeId) {
                    this.getController('MainController').openComputeInTab(computeId);
                },
                newvm: function(parentCompute) {
                    this.getView('compute.NewVmView').create({
                        parentCompute: parentCompute
                    }).show();
                }
            }
        });
    }
});
