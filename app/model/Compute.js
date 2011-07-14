Ext.define('opennodeconsole.model.Compute', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'name', type: 'string'},
        {name: 'status', type: 'string'},
        {name: 'ip_address', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'cpu', type: 'string'},
        {name: 'memory', type: 'string'},
        {name: 'os_release', type: 'string'},
        {name: 'kernel', type: 'string'}
    ]
});
