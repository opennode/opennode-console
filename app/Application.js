Ext.syncRequire([
	'Ext',
    'Ext.window.MessageBox',
    'Ext.XTemplate',
    'Ext.form.*',
    'Ext.ajax.*',
    'Ext.app.Controller'
]);

Ext.require([
    // used by log4js-ext
    'Ext.ux.RowExpander',
    'Ext.ux.statusbar.StatusBar',
    'Onc.core.Backend',
    'Onc.core.Proxy',
    'Onc.core.Store',
	'Onc.store.NodesStore',
    'Onc.core.EventBus',

    'Onc.core.polymorphic.Reader',
    'Onc.core.polymorphic.Association',

    'Onc.core.util.Deferred',
    'Onc.core.util.Scheduler',
    'Onc.core.util.Completer',

    'Onc.core.hub.Hub',
    'Onc.core.hub.Subscription',
    'Onc.core.hub.Sync',

    'Onc.core.manager.ComputeManager',

    'Onc.model.AuthenticatedUser',

    'Onc.core.ui.widgets.Tagger',
    'Onc.core.ui.widgets.Gauge',
    'Onc.core.ui.widgets.GaugeChart',
    'Onc.core.ui.widgets.Shell',
    'Onc.core.ui.widgets.Vnc',
    'Onc.core.ui.widgets.InfoBox',
    
    'Onc.core.ui.components.ComputeGauge',
    'Onc.core.ui.components.MemoryGauge',
    'Onc.core.ui.components.CPUGauge',
    'Onc.core.ui.components.NetworkGauge',
    'Onc.core.ui.components.DiskGauge',

    'Onc.view.tabs.Tab',
    'Onc.view.tabs.VmListTab',
    'Onc.view.tabs.VmListGridTab',
    'Onc.view.tabs.SystemTab',
    'Onc.view.tabs.NetworkTab',
    'Onc.view.tabs.StorageTab',
    'Onc.view.tabs.TemplatesTab',
    'Onc.view.tabs.ShellTab',
    'Onc.view.tabs.VncTab',
    'Onc.view.tabs.DashboardTab',
    'Onc.view.tabs.PortalTab',
    'Onc.portal.LogPortlet',
    'Onc.portal.PortalColumn',
    'Onc.portal.PortalDropZone',
    'Onc.portal.PortalPanel',
    'Onc.portal.Portlet',
    'Onc.portal.GaugesChartPortlet',
    'Onc.portal.InfoBoxesPortlet',
    'Onc.portal.TasksPortlet'
]);

Ext.onReady(function() {
  setTimeout(function(){
    var mask = Ext.get('loading');
    // a workaround for tests which don't have a special loading div
    if (mask !== null) {
        mask.remove();
        Ext.get('loading-mask').fadeOut({remove:true});
    }
  }, 250);
});


Ext.Loader.setConfig('paths', {

    'overrides': './overrides'  
});

Ext.Ajax.timeout = 200000;

Ext.override(Ext.data.Connection, {
    timeout : 200000
});

Ext.Loader.setConfig({enabled: true, disableCaching: false});



if (typeof console === 'undefined') {
    var c = console = {};
    c.debug = c.log = c.error = c.warn = c.assert = Ext.emptyFn;
}


// These are essentially IP address normalisers.
Ext.apply(Ext.data.SortTypes, {
    asIpv4: function(value) {
        return IPAddress.normalizeIpv4(value).addr;
    },

    asIpv6: function(value) {
        return IPAddress.normalizeIpv6(value).addr;
    }
});



Ext.apply(Ext.form.field.VTypes, {
    password: function(val, field) {
        if (field.initialPassField) {
            var pwd = field.up('form').down('#' + field.initialPassField);
            return (val == pwd.getValue());
        }
        return true;
    },

    passwordText: 'Passwords do not match'
});

//Get url parameters to check if there is embedded=true
var params = Ext.urlDecode(location.search.substring(1));
IS_EMBEDDED = (params["embedded"]) ? true : false; 




if (Ext.ENABLE_VMMAP == true) {
    Ext.syncRequire('Onc.view.tabs.VmMapTab');
}
Ext.define('Onc.Application', {
    name: 'Onc',

    extend: 'Ext.app.Application',
    
    requires:['Onc.model.Compute'],

    views: [
    'Onc.view.NotificationBarView'
        // TODO: add views here
    ],

    controllers: [
        'LoginController',
        'MainController',
        'ComputeController',
        'NewVmController',
        'EditVmController',
        'TasksController',
        'InfrastructureJoinController',
        'ZabbixRegistrationController',
        'ComputeStateController',
        'SearchController',
        'NotificationBarController',
        'RetryController',
        'MigrateController',
        'DashboardController',
        'OmsShellController'
    ],

    stores: [
        // TODO: add stores here
    ]
});


