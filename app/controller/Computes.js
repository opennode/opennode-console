Ext.define('opennodeconsole.controller.Computes', {
    extend: 'Ext.app.Controller',

    models: ['Compute'],
    stores: ['Computes'],
    views: ['compute.List', 'compute.View'],

    init: function() {
        this.control({
            'computelist': {
                selectionchange: function(view, selections, options) {
                    if (selections.length === 0)
                        return;

                    var selection = selections[0];
                    var computeId = selection.get('id');

                    var tabPanel = Ext.ComponentQuery.query('#mainTabs')[0];
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
            '#mainTabs': {
                tabchange: function(tabPanel, newTab) {
                    var computeId = newTab.computeId;
                    var computeList = Ext.ComponentQuery.query('computelist')[0];
                    var store = computeList.getStore();
                    computeList.select(store.getById(computeId));
                }
            }
        });
    }
});
