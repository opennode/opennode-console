Ext.define('Onc.view.compute.ComputeHeaderView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.computeheader',

//    height: 50,
    bodyPadding: 5,
    border: false,
    bodyStyle: 'background: inherit',

    layout: {type: 'auto', align: 'middle'},


    initComponent: function() {
        this.defaults = {
            style: 'position: relative !important; float: left;',

            margin: '0 5px',
            width: 200,
            border: true
        };

        this.items = [{
            xtype: 'cpugauge',
            compute: this.record,
            label: 'CPU',
            iconCls: 'icon-cpu'
        }, {
            xtype: 'memorygauge',
            compute: this.record,
            label: 'MEM',
            unit: 'MB',
            iconCls: 'icon-memory'
        }, {
            xtype: 'networkgauge',
            compute: this.record,
            label: 'NET',
            unit: 'Mbs',
            value: 0,
            convert: function(v) { return v * 8 / Math.pow(10, 6); },
            iconCls: 'icon-network'
        }, {
            xtype: 'diskgauge',
            compute: this.record,
            partition: '/',
            label: 'DISK (/)',
            unit: 'GB',
            display: ['fixed', 2],
            convert: function(v) { return v / 1024; },
            iconCls: 'icon-hd'
        }];

        this.callParent(arguments);
    }

});
