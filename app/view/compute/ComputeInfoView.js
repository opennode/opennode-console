Ext.define('opennodeconsole.view.compute.ComputeInfoView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.computeinfo',

    frame: true,
    height: 50,
    bodyPadding: 5,

    layout: {type: 'hbox', align: 'middle'},

    initComponent: function() {
        var rec = this.record;

        this.defaults = {
            xtype: 'gauge',
            margin: '0 5px',
            width: 160
        };
        this.items = [
            {label: 'CPU', value: 0, iconCls: 'icon-cpu'},
            {label: 'MEM', value: 0, max: rec.get('memory'), unit: 'MB'},
            {label: 'NET', value: 0, iconCls: 'icon-network', max: rec.get('network'), unit: 'Mbs'},
            {label: 'DISK', value: 0, iconCls: 'icon-hd', max: rec.get('diskspace'), unit: 'GB'}
        ];

        // TODO: Replace this with actual data from the server.
        // Feed the CPU and NET gauges with random values for demonstration purposes:
        var me = this;
        this._randomDataInterval = setInterval(function() {
            ['CPU', 'NET'].forEach(function(gaugeName) {
                var gauge = me.child('gauge[label=' + gaugeName + ']');
                var d = gauge.max * Math.random() * 0.1;
                gauge.setValue(Math.max(0, Math.min(gauge.max, gauge.value + (Math.random() < 0.5 ? +d : -d))));
            });
        }, 500);

        this.callParent(arguments);
    },

    onRender: function() {
        var rec = this.record;

        this.callParent(arguments);
        // TODO: Replace this with actual data from the server.
        // Initialise the gauges to random values for demonstration purposes:
        this.child('gauge[label=CPU]').setValue(Math.random());
        this.child('gauge[label=MEM]').setValue(Math.random() * rec.get('memory'));
        this.child('gauge[label=NET]').setValue(Math.random() * rec.get('network'));
        this.child('gauge[label=DISK]').setValue(Math.random() * rec.get('diskspace'));
    },

    onDestroy: function() {
        this.callParent(arguments);
        clearInterval(this._randomDataInterval);
        delete this._randomDataInterval;
    }
});
