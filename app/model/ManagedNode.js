Ext.define('Onc.model.ManagedNode', {
    extend: 'Onc.model.Base',
    fields: [
        {name: 'hostname', type: 'string'},
        {name: 'status', type: 'string', persist: false}
    ]
});
