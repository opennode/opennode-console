Ext.define('opennodeconsole.model.Compute', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'integer'},
        {name: 'name', type: 'string'},
        {name: 'status', type: 'string'},
        {name: 'ip_address', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'cpu', type: 'string'},
        {name: 'memory', type: 'integer'},
        {name: 'os_release', type: 'string'},
        {name: 'kernel', type: 'string'},
        {name: 'network', type: 'integer'},
        {name: 'diskspace', type: 'integer'},
        {name: 'swap_size', type: 'integer'},
        {name: 'diskspace_rootpartition', type: 'integer'},
        {name: 'diskspace_storagepartition', type: 'integer'},
        {name: 'diskspace_vzpartition', type: 'integer'},
        {name: 'diskspace_backuppartition', type: 'integer'}
    ]
});
