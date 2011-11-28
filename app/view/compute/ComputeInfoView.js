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
        this.__streamSubscribe();
    },

    __streamSubscribe: function() {
        console.assert(!this._hubListener);
        this._hubListener = this._onDataFromHub.bind(this);

        var baseUrl= this.record.get('url');
        Onc.hub.Hub.subscribe(this._hubListener, {
            'cpu': baseUrl + 'metrics/{0}_usage'.format('cpu'),
            'memory': baseUrl + 'metrics/{0}_usage'.format('memory'),
            'network': baseUrl + 'metrics/{0}_usage'.format('network'),
            'diskspace': baseUrl + 'metrics/{0}_usage'.format('diskspace'),
        });
    },

    __streamUnsubscribe: function() {
        Onc.hub.Hub.unsubscribe(this._hubListener);
    },

    _onDataFromHub: function(values) {
        Ext.Object.each(values, function(name, value) {
            console.debug('iter: name = %s, value = ', name, value)
            this.child('#{0}-gauge'.format(name)).setValue(value);
        }.bind(this));
        this.__streamUnsubscribe();
    },

    onDestroy: function() {
        this.callParent(arguments);
        clearInterval(this._randomDataInterval);
        delete this._randomDataInterval;
        this.__streamUnsubscribe();
    }
});
