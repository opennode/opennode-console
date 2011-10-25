Ext.define('opennodeconsole.model.Storage', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'path', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'usage', type: 'string'}
    ]
});
