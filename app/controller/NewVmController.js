Ext.define('opennodeconsole.controller.NewVmController', {
    extend: 'Ext.app.Controller',

    models: ['Compute'],
    stores: ['Computes'],
    views: ['compute.New']
});
