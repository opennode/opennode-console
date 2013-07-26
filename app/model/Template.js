Ext.define('Onc.model.Template', {
    extend: 'Onc.model.Base',

    fields: [
        {name: 'id', type: 'string'},
        {name: 'url', type: 'string'},
        {name: 'tags'},
        {name: 'name', type: 'string'},
        {name: 'base_type', type: 'string'},
        {name: 'username', type: 'string'}
        {name: 'password', type: 'string'},
        {name: 'nameserver', type: 'string'},
        {name: 'ip', type: 'string'},

        {name: 'cores_min', mapping: "cores", convert: idx(0)},
        {name: 'cores_default', mapping: "cores", convert: idx(1)},
        {name: 'cores_max', mapping: "cores", convert: idx(2)},

        {name: 'memory_min', mapping: "memory", convert: idx(0)},
        {name: 'memory_default', mapping: "memory", convert: idx(1)},
        {name: 'memory_max', mapping: "memory", convert: idx(2)},

        {name: 'swap_min', mapping: "swap", convert: idx(0)},
        {name: 'swap_default', mapping: "swap", convert: idx(1)},
        {name: 'swap_max', mapping: "swap", convert: idx(2)},

        {name: 'disk_min', mapping: "disk", convert: idx(0)},
        {name: 'disk_default', mapping: "disk", convert: idx(1)},
        {name: 'disk_max', mapping: "disk", convert: idx(2)},

        {name: 'cpu_limit_min', mapping: "cpu_limit", convert: idx(0)},
        {name: 'cpu_limit_default', mapping: "cpu_limit", convert: idx(1)},
        {name: 'cpu_limit_max', mapping: "cpu_limit", convert: idx(2)},
        
        {name: 'name_and_base_type', convert: function(_, record) {
            return Ext.String.format("{0} ({1})", record.get('name'), record.get('base_type'));
        }},

        {name: 'name_short', convert: function(_, record) {
            return record.get('name').split("-")[0];
        }}
    ]
});
