Ext.define('opennodeconsole.controller.Computes', {
    extend: 'Ext.app.Controller',

    models: ['Compute'],
    stores: ['Computes'],
    views: ['compute.List', 'compute.View'],

    init: function() {
        this.control({
            'computelist': {
                selectionchange: function(view, selections, options) {
                    console.assert(selections.length === 1);
                    Ext.ComponentQuery.query('[loadRecord]').forEach(function(cmp) {
                        cmp.loadRecord(selections[0]);
                    });
                }
            }
        });
    }
});
