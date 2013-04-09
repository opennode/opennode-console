Ext.define('Onc.store.VmProfilesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.VmProfile',

    data: [{
        "id": "1",
        "name": "S",
        "num_cores": 1,
        "memory": 1,
        "diskspace": 10
    }, {
        "id": "2",
        "name": "M",
        "num_cores": 3,
        "memory": 3,
        "diskspace": 30
    }, {
        "id": "3",
        "name": "L",
        "num_cores": 8,
        "memory": 8,
        "diskspace": 80
    }],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
