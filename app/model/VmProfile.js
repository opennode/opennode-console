Ext.define('Onc.model.VmProfile', {
    extend: 'Onc.model.Base',
    fields: [{
        name: 'id',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'num_cores',
        type: 'integer'
    }, {
        name: 'memory',
        type: 'float'
    }, {
        name: 'diskspace',
        type: 'float'
    }, {
        name: 'profile',
        convert: function(_, record) {
            var resp = "";
            var cores = record.get('num_cores');
            resp += record.get('name') + ": ";
            resp += cores;
            resp += (cores > 1) ? ' cores ' : ' core ';
            resp += record.get('memory') + "GB ";
            resp += record.get('diskspace') + "HDD ";
            return resp;
        }
    }]

});
