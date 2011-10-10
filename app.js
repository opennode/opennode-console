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


Ext.apply(Ext.data.SortTypes, {
    asIpv4: function(ipv4Address) {
        var ret;
        ret = ipv4Address.split('.');
        ret = ret.map(function(part) {
            // Have to return `String`s because of the way `Array.sort` works in Javascript
            return Ext.String.leftPad(part, 3, '0');
        });
        return ret.join('.');  // Could use '', but with '.' it's more intuititive;
    },

    asIpv6: function(ipv6Address) {
        var ipAndSubnet = ipv6Address.split('/');

        var ipAddress = ipAndSubnet[0];
        var subnet = parseInt(ipAndSubnet[1]);

        function _makeSortable(ipAddress, subnet) {
            console.assert(subnet % 4 === 0);
            subnet = subnet / 4;  // 4 bits per 1 hex digit

            // Split all digits:
            var hexSeq = ipAddress.split(/:+/).join('').split(new RegExp(''));

            var zerosForSubnetMask = [0].repeat(subnet);
            hexSeq.splice.apply(hexSeq, [-subnet, subnet].concat(zerosForSubnetMask));

            var asZeroPaddedDecimals = hexSeq.map(function(i) {
                i = parseInt(i, 16);
                return Ext.String.leftPad(i, 2, '0');
            });

            return asZeroPaddedDecimals.join('.');  // Could use '', but with '.' it's more intuititive;
        }

        return (_makeSortable(ipAddress, subnet) +
                '--' +
                _makeSortable(ipAddress, 0));
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
