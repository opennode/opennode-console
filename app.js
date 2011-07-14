Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';

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
                xtype: 'computelist',
                width: 200
            }, {
                region: 'center'
                xtype: 'computeview',
            }]
        });
    }
});
