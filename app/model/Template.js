Ext.define('opennodeconsole.model.Template', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'id', type: 'string'},
        {name: 'url', type: 'string'},
        {name: 'tags'},

        {name: 'name', type: 'string'},
        {name: 'base_type', type: 'string'},
        {name: 'min_cores', type: 'integer'},
        {name: 'max_cores', type: 'integer'},
        {name: 'min_memory', type: 'integer'},
        {name: 'max_memory', type: 'integer'},

        {name: 'name_and_base_type', convert: function(_, record) {
            return Ext.String.format("{0} ({1})", record.get('name'), record.get('base_type'));
        }}
    ]
});
