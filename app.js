Ext.BLANK_IMAGE_URL = 'lib/ext-4.1/resources/themes/images/default/tree/s.gif';

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
    'Ext': 'lib/ext-4.1/src',
    'Onc': './app',
    'Ext.ux': 'lib/ext-4.1/examples/ux'
});

Ext.Ajax.timeout = 200000;

Ext.override(Ext.data.Connection, {
    timeout : 200000
});

Ext.Loader.setConfig({enabled: true, disableCaching: false});

Ext.syncRequire([
    'Ext.window.MessageBox',
    'Ext.XTemplate',
    'Ext.form.*',

    // used by log4js-ext
    'Ext.ux.RowExpander',
    'Ext.ux.statusbar.StatusBar',

    'Onc.core.Backend',
    'Onc.core.Proxy',
    'Onc.core.Store',
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
    'Onc.core.ui.widgets.Shell',
    'Onc.core.ui.widgets.Vnc',

    'Onc.core.ui.components.ComputeGauge',
    'Onc.core.ui.components.MemoryGauge',
    'Onc.core.ui.components.CPUGauge',
    'Onc.core.ui.components.NetworkGauge',
    'Onc.core.ui.components.DiskGauge',

    'Onc.view.tabs.Tab',
    'Onc.view.tabs.VmListTab',
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
    'Onc.portal.GaugesChartPortlet'
]);

if (ENABLE_VMMAP == true) {
    Ext.syncRequire('Onc.view.tabs.VmMapTab');
}

Ext.application({
    name: 'Onc',

    appFolder: 'app',
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
    ]
});

Ext.override(Ext.Base, {
    toString: function() {
        return '<{0}>'.format(this.$className);
    },

    cls: function() { return this.$className.split('.').pop(); }
});


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


Ext.data.Association.create = function(association){
    if (!association.isAssociation) {
        if (Ext.isString(association)) {
            association = {
                type: association
            };
        }

        switch (association.type) {
        case 'belongsTo':
            return Ext.create('Ext.data.BelongsToAssociation', association);
        case 'hasMany':
            return Ext.create('Ext.data.HasManyAssociation', association);
        case 'polymorphic':
            return Ext.create('association.polymorphic', association);
        default:
            //<debug>
            Ext.Error.raise('Unknown Association type: "' + association.type + '"');
            //</debug>
        }
    }
    return association;
};


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
