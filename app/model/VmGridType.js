Ext.define('Onc.model.VmGridType', {
    extend: 'Onc.model.Base',

    fields: [{
        name: 'id',
        type: 'string',
        persist: false
    }, {
        name: 'url',
        type: 'string',
        persist: false
    }, {
        name: 'name',
        convert: function(_, record) {
            var id = record.get('id');
            var t = (id == "computes") ? "" : "(hangar)";
            return Ext.String.format("{0} {1}", id, t);
        }
    }, ]

});
