Ext.define('Onc.model.NetworkInterface', {
    extend: 'Onc.model.Base',
    fields: [
        'id',
        'url',
        'name',
        'hw_address',
        'state',
        {name: 'ipv4_address', type: 'string', sortType: 'asIpv4'},
        {name: 'ipv6_address', type: 'string', sortType: 'asIpv6'},
        {name: 'metric', type: 'integer'},
        'bcast',
        {name: 'stp', type: 'boolean'},
        'rx',
        'tx',
        'members',
        {name: 'subnet_mask', type: 'string', convert: function(_, rec) {
            var ipAddress = rec.get('ipv4_address');
            return !ipAddress ? '' : IPAddress.normalizeIpv4(ipAddress).netmask;
        }}
    ],

    belongsTo: 'Onc.model.NetworkInterfaces'
});
