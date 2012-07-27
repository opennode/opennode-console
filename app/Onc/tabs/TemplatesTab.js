Ext.define('Onc.tabs.TemplatesTab', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.computetemplatestab',

    title: 'Templates',
    forceFit: true,
    multiSelect: true,
    header: false,
    border: false,

    columns: [
        {header: 'ID', dataIndex: 'id', hidden: true},
        {header: 'Name', dataIndex: 'name'},
        {header: 'Base Type', dataIndex: 'base_type'},
        {header: 'Password', dataIndex: 'password', hidden: true},
        {header: 'Nameserver', dataIndex: 'nameserver'},
        {header: 'Default IP', dataIndex: 'ip'},

        {header: 'Min. Memory', dataIndex: 'memory_min'},
        {header: 'Default Memory', dataIndex: 'memory_default'},
        {header: 'Max. Memory', dataIndex: 'memory_max', hidden: true},

        {header: 'Min. Disk', dataIndex: 'disk_min'},
        {header: 'Default Disk', dataIndex: 'disk_default'},
        {header: 'Max. Disk', dataIndex: 'disk_max', hidden: true},

        {header: 'Min. Cores', dataIndex: 'cores_min', hidden: true},
        {header: 'Default Cores', dataIndex: 'cores_default', hidden: true},
        {header: 'Max. Cores', dataIndex: 'cores_max', hidden: true},

        {header: 'Min. CPU Limit', dataIndex: 'cpu_limit_min', hidden: true},
        {header: 'Default CPU Limit', dataIndex: 'cpu_limit_default', hidden: true},
        {header: 'Max. CPU Limit', dataIndex: 'cpu_limit_max', hidden: true},
    ],

    initComponent: function() {
        this.store = this.record.getList('templates');
        this.callParent(arguments);
    }
});
