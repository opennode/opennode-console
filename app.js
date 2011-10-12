Ext.BLANK_IMAGE_URL = 'ext-4.0/resources/themes/images/default/tree/s.gif';

Ext.Loader.setConfig('paths', {
    'opennodeconsole': './app/opennodeconsole'
});

Ext.syncRequire([
    'Ext.MessageBox',
    'Ext.XTemplate',
    'opennodeconsole.widgets.Gauge',
    'opennodeconsole.widgets.ComputeInfo',
    'opennodeconsole.widgets.ComputeListFilter',
    'opennodeconsole.tabs.Tab',
    'opennodeconsole.tabs.StatusTab',
    'opennodeconsole.tabs.SystemTab',
    'opennodeconsole.tabs.NetworkTab',
    'opennodeconsole.tabs.StorageTab',
    'opennodeconsole.tabs.TemplatesTab',
]);

Ext.application({
    name: 'opennodeconsole',

    appFolder: 'app',
    controllers: ['Computes'],

    launch: function() {
        Ext.create('Ext.container.Viewport', {
            layout: 'border',
            items: [{
                region: 'north',
                id: 'header',
                html: '<h1>OpenNode Console</h1>infrastructure management',
                bodyPadding: 5,
                frame: true
            }, {
                region: 'west',
                layout: {type: 'vbox', align: 'stretchmax'},
                items: [
                    {xtype: 'computelistfilter'},
                    {xtype: 'computelist', flex: 1}
                ]
            }, {
                region: 'center',
                itemId: 'mainTabs',
                xtype: 'tabpanel',
                preventHeader: true,
                defaults: {
                    closable: true
                }
            }]
        });
    }
});


if (typeof console === 'undefined') {
    var c = console = {};
    c.debug = c.log = c.error = c.warn = c.assert = Ext.emptyFn;
}


// These are essentially IP address normalisers.
Ext.apply(Ext.data.SortTypes, {
    asIpv4: function(value) {
        return value.split('.').map(function(part) {
            // Have to return `String`s because of the way `Array.sort` works in Javascript
            return Ext.String.leftPad(part, 3, '0');
        }).join('.');
    },

    asIpv6: function(value) {
        var address = value.split('/')[0];
        var groups = address.split(':');

        if (/[^0-9a-f:]/i.test(address) ||  // Chars other than HEX or :
            /[^:]{5,}/.test(address) ||  // More than 4 digits in a group
            /:{3,}/.test(address) ||  // :::, ::::, etc
            /:{2}/.test(address) && groups.length === 8 ||  // Extraneous ::
            groups.length > 8 ||
            groups.length < 8 && !/:{2}/.test(address))  // Missing ::
        {
            throw new Error('Invalid IPv6 address format');
        }

        if (groups.length < 8) {
            var extraZeroGroups = ['0000'].repeat(8 - groups.length + 1);
            var i = groups.indexOf('');
            console.assert(i !== -1);
            groups.splice.apply(groups, [i, 1].concat(extraZeroGroups));
            console.assert(groups.length === 8);
        }

        return groups.map(function(part) {
            return Ext.String.leftPad(part, 4, '0');
        }).join(':');
    }
});


String.prototype.repeat = function(n) {
    var ret = '';
    for (var i = n; i > 0; i -= 1)
        ret += this;
    return ret;
};


Array.prototype.repeat = function(n) {
    if (n < 0) throw new Error('Argument must be non-negative');
    ret = [];
    for (var i = n; i > 0; i -= 1)
        ret = ret.concat(this);
    return ret;
};
