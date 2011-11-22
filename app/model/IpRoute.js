Ext.define('Onc.model.IpRoute', {
    extend: 'Onc.model.Base',

    fields: [
        {name: 'id', type: 'string'},
        {name: 'destination' , type: 'string', sortType: 'asIpv4'},
        {name: 'gateway', type: 'string', sortType: 'asIpv4'},
        {name: 'genmask', type: 'string', sortType: 'asIpv4'},
        {name: 'flags', type: 'string'},
        {name: 'metric', type: 'int'},
        {name: 'iface', type: 'string'}
    ]
});
