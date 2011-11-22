Ext.define('Onc.model.IpRoute', {
    extend: 'Ext.data.Model',

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
