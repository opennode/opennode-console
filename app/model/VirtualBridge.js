Ext.define('Onc.model.VirtualBridge', {
    extend: 'Onc.model.Base',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'ipv4_address', type: 'string', sortType: 'asIpv4'},
        {name: 'ipv6_address', type: 'string', sortType: 'asIpv6'},
        {name: 'bcast', type: 'string'},
        {name: 'hw_address', type: 'string'},
        {name: 'metric', type: 'int'},
        {name: 'stp', type: 'boolean'},
        {name: 'rx', type: 'string'},
        {name: 'tx', type: 'string'},
        {name: 'members', convert: function(value) {
            // XXX: This is needed because there seems to be no way to
            // read in model fields as `Array`s.  `Array`s in the
            // (JSON) data will be stored as plain `Object`s when the
            // `type` of the field is set to `'auto'`.
            return value.toString().split(',');
        }},
        {name: 'subnet_mask', type: 'string', convert: function(_, rec) {
            var ipAddress = rec.get('ipv4_address');
            return !ipAddress ? '' : IPAddress.normalizeIpv4(ipAddress).netmask;
        }}
    ]
});
