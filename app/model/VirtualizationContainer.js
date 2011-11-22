Ext.define('Onc.model.VirtualizationContainer', {
    extend: 'Onc.model.Base',
    fields: ['id', 'url', 'backend'],

    belongsTo: 'Onc.model.Compute',

    hasMany: {
        name: 'children',
        model: 'Onc.model.Compute'
    }
});
