Ext.define('Onc.store.IncomingNodesStore', {
  	extend: 'Onc.store.NodesStore',
    model: 'Onc.model.ManagedNode',
    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },

        extraParams: {
            'depth': 2
        },
        url: '/machines/incoming/salt'
    }   
});
