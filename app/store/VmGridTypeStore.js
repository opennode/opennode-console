Ext.define('Onc.store.VmGridTypeStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.VmGridType',

    autoLoad: true,

    staticData: [{
        "id": "computes",
        "url": "computes"
    }],

 /*   sorters: [{
        property: 'id',
        transform: function(val) {
            return val.toLowerCase();
        }
    }],*/

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },
        extraParams: {
            'depth': 1
        },
        limitParam: null,
        pageParam: null,
        startParam: null,
        url: 'machines/hangar'
    },
    listeners: {
        beforeload: function(store, options) {

        },
        load: function(store, records, successful, eOpts) {
            store.loadData(store.staticData, true);
        }
    }
});
