Ext.define('Onc.view.compute.ComputeInfoView', {
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
            {label: 'CPU', itemId: 'cpu-gauge', value: 0, iconCls: 'icon-cpu', max: rec.getMaxCpuLoad()},
            {label: 'MEM', itemId: 'memory-gauge', value: 0, max: rec.get('memory'), unit: 'MB'},
            {label: 'NET', itemId: 'network-gauge', value: 0, iconCls: 'icon-network', max: rec.get('network'), unit: 'Mbs'},
            {label: 'DISK', itemId: 'diskspace-gauge', value: 0, iconCls: 'icon-hd', max: rec.get('diskspace')['total'], unit: 'GB'}
        ];

        this.callParent(arguments);
    },

    onRender: function() {
        this.callParent(arguments);

        this._hubListener = this._onDataFromHub.bind(this)

        var baseUrl= this.record.get('url');
        var urls = this._hubUrls = {};

        Onc.hub.Hub.subscribe(
            ['cpu', 'memory', 'network', 'diskspace'].map(function(i) {
                var ret = baseUrl + 'metrics/{0}_usage'.format(i);
                urls[ret] = i;
                return ret;
            }),
            this._hubListener
        );
    },

    _onDataFromHub: function(values) {
        Ext.Object.each(values, function(resource, value) {
            var name = this._hubUrls[resource];
            var gauge = this.child('#{0}-gauge'.format(name));
            gauge.setValue(value);
        }.bind(this));
    },

    onDestroy: function() {
        this.callParent(arguments);
        clearInterval(this._randomDataInterval);
        delete this._randomDataInterval;
    }
});
