Ext.define('opennodeconsole.model.VirtualBridge', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'ipv4_address', type: 'string'},
        {name: 'ipv6_address', type: 'string'},
        {name: 'subnet_mask', type: 'string'},
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
    ]
});
