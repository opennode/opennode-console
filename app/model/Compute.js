Ext.define('opennodeconsole.model.Compute', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'integer'},
        {name: 'hostname', type: 'string'},
        {name: 'state', type: 'string'},
        {name: 'ipv4_address', type: 'string', sortType: 'asIpv4'},
        {name: 'ipv6_address', type: 'string', sortType: 'asIpv6'},
        {name: 'type', type: 'string'},
        {name: 'cpu', type: 'string'},
        {name: 'memory', type: 'integer'},
        {name: 'os_release', type: 'string'},
        {name: 'kernel', type: 'string'},
        {name: 'network_usage', type: 'integer'},
        {name: 'diskspace', type: 'integer'},
        {name: 'swap_size', type: 'integer'},
        {name: 'diskspace_rootpartition', type: 'integer'},
        {name: 'diskspace_storagepartition', type: 'integer'},
        {name: 'diskspace_vzpartition', type: 'integer'},
        {name: 'diskspace_backuppartition', type: 'integer'},
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

    hasMany: [
        {model: 'opennodeconsole.model.Compute', name: 'vms'},
        {
            model: 'opennodeconsole.model.VirtualBridge',
            name: 'bridgeInterfaces',
            associationKey: 'bridge_interfaces'
        }
    ]
});
