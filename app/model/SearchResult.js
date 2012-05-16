Ext.define('Onc.model.SearchResult', {
    extend: 'Onc.model.Base',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'url', type: 'string'},
        {name: 'hostname', type: 'string'},
        {name: 'state', type: 'string'},
        {name: 'ipv4_address', type: 'string'},
        {name: '__type__', type: 'string'}

    ],

proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },
        extraParams: {
            'depth': 1,
            'attrs': 'hostname,ipv4_address,state'
        },
        limitParam: null, pageParam: null, startParam: null,
        url: 'computes'
    }

});
