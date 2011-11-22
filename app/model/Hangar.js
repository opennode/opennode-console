Ext.define('Onc.model.Hangar', {
    extend: 'Onc.model.Base',
    fields: [
        {name: 'id', type: 'string'},
    ],

    belongsTo: 'Onc.model.Compute',

    hasMany: {
        name: 'children',
        model: 'Onc.model.Compute'
    }
});
