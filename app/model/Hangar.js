Ext.define('opennodeconsole.model.Hangar', {
    extend: 'opennodeconsole.model.Base',
    fields: [
        {name: 'id', type: 'string'},
    ],

    belongsTo: 'opennodeconsole.model.Compute',

    hasMany: {
        name: 'children',
        model: 'opennodeconsole.model.Compute'
    }
});
