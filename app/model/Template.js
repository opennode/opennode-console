Ext.define('opennodeconsole.model.Template', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'base_os', type: 'string'},
        {name: 'min_disk', type: 'string'},
        {name: 'min_memory', type: 'string'},
        {name: 'min_cpu', type: 'string'},
        {name: 'storage_name', type: 'string'}
    ]
});
