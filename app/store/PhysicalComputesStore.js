Ext.define('Onc.store.PhysicalComputesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Compute',

    filters: new Ext.util.Filter({
        filterFn: function(item) {
            return item.getChild('vms');
        }
    })
});

