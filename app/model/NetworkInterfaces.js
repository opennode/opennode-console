Ext.define('Onc.model.NetworkInterfaces', {
    extend: 'Onc.model.Base',
    fields: ['id'],

    belongsTo: 'Onc.model.Compute',

    hasMany: {
        name: 'children',
        model: 'Onc.model.NetworkInterface'
    }
});
