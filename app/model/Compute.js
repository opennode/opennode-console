Ext.define('opennodeconsole.model.Compute', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'string'},

        {name: 'architecture', type: 'string'},
        {name: 'cpu_info', type: 'string'},
        {name: 'os_release', type: 'string'},
        {name: 'kernel', type: 'string'},
        {name: 'disk_info', type: 'string'},
        {name: 'memory_info', type: 'string'},

        {name: 'hostname', type: 'string'},
        {name: 'ipv4_address', type: 'string', sortType: 'asIpv4'},
        {name: 'ipv6_address', type: 'string', sortType: 'asIpv6'},

        {name: 'state', type: 'string'},
        {name: 'effective_state', type: 'string'},

        {name: 'num_cores', type: 'integer'},
        {name: 'memory', type: 'float'},
        {name: 'diskspace'},
        {name: 'network', type: 'float'},
        {name: 'swap_size', type: 'float'},

        {name: 'cpu_usage', type: 'float'},
        {name: 'memory_usage', type: 'float'},
        {name: 'diskspace_usage'},
        {name: 'network_usage', type: 'float'},

        {name: 'startup_timestamp', type: 'string'}
    ],

    getUptime: function() {
        if (this.get('state') === 'inactive')
            return 'NaN';
        var timestamp = new Date(Date.parse(this.get('startup_timestamp')));

        var s = Math.round((+(new Date()) - +timestamp) / 1000);

        var days = Math.floor(s / 86400);
        s -= days * 86400;

        var hours = Math.floor(s / 3600);
        s -= hours * 3600;

        var mins = Math.floor(s / 60);
        s -= mins * 60;

        return '' + days + 'd ' + hours + 'h ' + mins + 'm ' + s + 's';
    },

    getChild: function(name) {
        return this.children().findRecord('id', name);
    },

    getList: function(name) {
        var child = this.getChild(name);
        return child ? child.children() : null;
    },

    associations: [
        {
            type: 'polymorphic',
            model: 'opennodeconsole.model.Base',
            name: 'children',
            getTypeDiscriminator: function(node) {
                return'opennodeconsole.model.' + node['__type__'];
            }
        }
    ],
    hasMany: [
        {
            model: 'opennodeconsole.model.VirtualBridge',
            name: 'bridgeInterfaces',
            associationKey: 'bridge_interfaces'
        },
        {
            model: 'opennodeconsole.model.IpRoute',
            name: 'routes'
        },
        {
            model: 'opennodeconsole.model.Storage',
            name: 'storages'
        }
    ]
});
