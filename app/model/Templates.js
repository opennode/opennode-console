Ext.define('opennodeconsole.model.Templates', {
    extend: 'opennodeconsole.model.Base',
    fields: ['id'],

    belongsTo: 'opennodeconsole.model.Compute',

    hasMany: {
        name: 'children',
        model: 'opennodeconsole.model.Template'
    }
});
