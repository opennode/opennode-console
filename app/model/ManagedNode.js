Ext.define('Onc.model.ManagedNode', {
    extend: 'Onc.model.Base',
    fields: [
		{name: 'id', type: 'string'},
        {name: 'hostname', type: 'string'},
        {name: 'status', type: 'string', persist: false},
        {name: 'blacklisted_for_allocation', type: 'boolean'}
    ]
});
