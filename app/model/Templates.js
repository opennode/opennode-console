Ext.define('Onc.model.Templates', {
    extend: 'Onc.model.Base',
    fields: ['id'],

    belongsTo: 'Onc.model.Compute',

    hasMany: {
        name: 'children',
        model: 'Onc.model.Template'
    }
});
