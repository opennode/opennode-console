Ext.BLANK_IMAGE_URL = 'ext-4.0/resources/themes/images/default/tree/s.gif';

Ext.Loader.setConfig('paths', {
    'Ext': 'ext-4.0/src',
    'Onc': './app/Onc'
});

Ext.Loader.setConfig({enabled: true, disableCaching: false})

Ext.syncRequire([
    'Onc.ConfigLoader',

    'Ext.window.MessageBox',
    'Ext.XTemplate',
    'Ext.form.*',

    'Onc.widgets.Gauge',
    'Onc.widgets.Shell',
    'Onc.widgets.Vnc',
    'Onc.tabs.Tab',
    'Onc.tabs.VmListTab',
    'Onc.tabs.SystemTab',
    'Onc.tabs.NetworkTab',
    'Onc.tabs.StorageTab',
    'Onc.tabs.TemplatesTab',
    'Onc.tabs.ShellTab',
    'Onc.tabs.VncTab',
    'Onc.polymorphic.Reader',
    'Onc.polymorphic.Association',

    'Onc.util.Deferred',
    'Onc.Backend',
    'Onc.Proxy',
    'Onc.util.Scheduler',
    'Onc.hub.Hub',
    'Onc.hub.Sync'
]);

Onc.ConfigLoader.load('conf-default.js');
Onc.ConfigLoader.load('config.js')

Ext.application({
    name: 'Onc',

    appFolder: 'app',
    controllers: ['LoginController', 'MainController', 'ComputeController', 'NewVmController']
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
