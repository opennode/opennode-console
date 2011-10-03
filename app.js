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
