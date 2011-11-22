Ext.define('Onc.model.Storage', {
    extend: 'Onc.model.Base',

    fields: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'path', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'usage', type: 'string'}
    ]
});
