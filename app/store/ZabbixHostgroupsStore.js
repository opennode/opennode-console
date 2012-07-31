Ext.define('Onc.store.ZabbixHostgroupsStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.ZabbixHostgroup',

    proxy: {
        type: 'rest',
        reader: {
            type: 'json',
            root: 'children'
        },
        extraParams: {
            'attr': 'zabbix_hostgroups'
        },
        url: Onc.core.Backend.url('monitoring/zabbix')
    }
});
