Ext.define('Onc.model.SearchResult', {
    extend: 'Onc.model.Base',
    fields: [
        {name: 'id', type: 'string', persist: false},
        {name: 'url', type: 'string', persist: false},
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
            'attrs': 'hostname,ipv4_address,state,url'
        },
        limitParam: null, pageParam: null, startParam: null,
        url: 'computes'
    }

});
