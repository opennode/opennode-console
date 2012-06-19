Ext.define('Onc.model.Task', {
    extend: 'Onc.model.Base',

    fields: [
        {name: 'id', type: 'string'},
        {name: '__type__', type: 'string'},
        {name: 'url', type: 'string'},
    ],

    associations: [
        {
            type: 'polymorphic',
            model: 'Onc.model.Base',
            name: 'children',
            getTypeDiscriminator: function(node) {
                return'Onc.model.' + node['__type__'];
            }
        }
    ],

    hasMany: [
        {
            model: 'Onc.model.Command',
            name: 'actions',
        }
    ],
});
