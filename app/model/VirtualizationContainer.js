Ext.define('opennodeconsole.model.VirtualizationContainer', {
    extend: 'opennodeconsole.model.Base',
    fields: ['id', 'url', 'backend'],

    belongsTo: 'opennodeconsole.model.Compute',

    hasMany: {
        name: 'children',
        model: 'opennodeconsole.model.Compute'
    }
});
