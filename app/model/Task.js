Ext.define('Onc.model.Task', {
    extend: 'Onc.model.Base',

    fields: [
        {name: 'id', type: 'integer'},
        {name: '__type__', type: 'string'},
        {name: 'url', type: 'string'},
        {name: 'cmdline', type: 'string'},
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


    getChild: function(name) {
        return this.children().findRecord('id', name);
    },

    getList: function(name) {
        var child = this.getChild(name);
        return child ? child.children() : null;
    },

    getActions: function() {
        return this.getList('actions');
    }
});
