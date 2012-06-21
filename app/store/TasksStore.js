Ext.define('Onc.store.TasksStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Task',

    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children'
        },
        extraParams: {
            depth: 3,
            exclude: 'completed'
        },
        url: 'proc'
    },

    sorters: [
        {
            property : 'id',
            direction: 'ASC'
        }
    ]

});
