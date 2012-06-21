Ext.define('Onc.model.ActionsContainer', {
    extend: 'Onc.model.Base',
    fields: ['id'],

    hasMany: {
        name: 'children',
        model: 'Onc.model.Command'
    }
});
