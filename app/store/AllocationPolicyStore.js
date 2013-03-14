Ext.define('Onc.store.AllocationPolicyStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.AllocationPolicy',

    autoLoad: true,

    staticData: [{
        "id": "automatic",
        "url": "automatic",
        "hostname": "Automatic",
    }],

    sorters: [{
        property: 'hostname',
        transform: function(val) {
            return val.toLowerCase();
        }
    }],

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },
        extraParams: {
            'depth': 1,
            'attrs': 'hostname,url',
            'q': 'virt:no'
        },
        limitParam: null,
        pageParam: null,
        startParam: null,
        url: 'computes'
    },
    listeners: {
        beforeload: function(store, options) {

        },
        load: function(store, records, successful, eOpts) {
            store.loadData(store.staticData, true);
        }
    },
});
