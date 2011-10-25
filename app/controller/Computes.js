Ext.define('opennodeconsole.controller.Computes', {
    extend: 'Ext.app.Controller',

    models: ['Compute', 'VirtualBridge', 'IpRoute', 'Storage', 'Template'],
    stores: ['Computes'],
    views: ['compute.List', 'compute.View'],

    refs: [{ref: 'list', selector: 'computelist'},
           {ref: 'tabs', selector: '#mainTabs'}],

    init: function() {
        this.control({
            'computelist': {
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
            'computelistfilter': {
                'changed': function(keywords) {
                    this.getList().applyFilter(keywords);
                }
            },
            '#mainTabs': {
                tabchange: function(tabPanel, newTab) {
                    var computeId = newTab.computeId;
                    var computeList = this.getList();
                    var store = computeList.getStore();
                    var selModel = computeList.getSelectionModel();
                    if (computeList.getStore().getById(computeId))
                        selModel.select(store.getById(computeId));
                    else
                        selModel.deselect(selModel.getSelection());
                }
            }
        });
    }
});
