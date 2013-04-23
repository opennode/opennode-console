Ext.define('Onc.store.VirtualizationContainerStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Compute',

    autoLoad: true,// important: so /machines/{computeID}/vms-openvz/ is registered with HUB and events like remove are received

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },

        extraParams: {
            'exclude': 'tasks,incoming,templates,consoles,routes,interfaces',
            'attrs': '__type__,url,children',
            'depth': 2
        },

        url: 'machines/'
    }
});
