Ext.define('Onc.controller.DashboardController', {
    extend: 'Ext.app.Controller',

    stores: ['ComputesStore', 'PhysicalComputesStore', 'GaugesChartComputesStore', 'TasksPortletStore', 'VmGridTypeStore'],

});