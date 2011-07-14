Ext.define('opennodeconsole.view.compute.View', {
    extend: 'Ext.Container',
    alias: 'widget.computeview',

    layout: {type: 'vbox', align: 'stretch'},

    initComponent: function() {
        this.title = this.record.get('name');
        this.tabConfig = {
            tooltip: (this.record.get('name') + '<br/>' +
                      this.record.get('ip_address') + '<br/>' +
                      this.record.get('type'))
        };

        this.items = [{
            xtype: 'computeinfo',
            record: this.record
        }, {
            flex: 1,
            xtype: 'tabpanel',
            activeTab: 0,
            items: [{
                title: 'Status',
                xtype: 'computestatustab'
            }, {
                title: 'System',
                // xtype: 'computesystemtab'
            }, {
                title: 'Network',
                // xtype: 'computenetworktab'
            }, {
                title: 'Storage',
                // html: 'computestoragetab'
            }, {
                title: 'Templates',
                // html: 'computetemplatestab'
            }]
        }];

        this.callParent(arguments);
    }
});


Ext.define('opennodeconsole.view.compute.Info', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.computeinfo',

    frame: true,
    height: 50,
    bodyPadding: 5,

    layout: {type: 'hbox', align: 'middle'},

    initComponent: function() {
        this.defaults = {
            xtype: 'gauge',
            margin: '0 5px'
        };
        this.items = [
            {label: 'CPU', value: 0},
            {label: 'MEM', value: 0, max: this.record.get('memory'), unit: 'MB'},
            {label: 'NET', value: 0, max: this.record.get('network'), unit: 'Mbs'},
            {label: 'DISK', value: 0, max: this.record.get('diskspace'), unit: 'GB'}
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
        this.callParent(arguments);
        // TODO: Replace this with actual data from the server.
        // Initialise the gauges to random values for demonstration purposes:
        this.child('gauge[label=CPU]').setValue(Math.random());
        this.child('gauge[label=MEM]').setValue(Math.random() * this.record.get('memory'));
        this.child('gauge[label=NET]').setValue(Math.random() * this.record.get('network'));
        this.child('gauge[label=DISK]').setValue(Math.random() * this.record.get('diskspace'));
    },

    onDestroy: function() {
        clearInterval(this._randomDataInterval);
        delete this._randomDataInterval;
    }
});


Ext.define('opennodeconsole.view.compute.StatusTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.computestatustab',

    html: 'Status tab'
});


Ext.define('opennodeconsole.widgets.Gauge', {
    extend: 'Ext.Component',
    alias: 'widget.gauge',
    cls: 'gauge',

    width: 125,

    value: 0.0,
    max: 1.0,
    unit: null,
    criticalLevel: 0,
    criticalCurve: 5,

    tpl: new Ext.XTemplate(
        '<span>',
        '    <label>{label}</label> ',
        '    <span class="value"></span>%',
        '    <tpl if="unit"> of {max}{unit}</tpl>',
        '</span>',
        '<div class="bar"><div></div></div>'
    ),

    onRender: function() {
        this.callParent(arguments);
        this.tpl.overwrite(this.el, this);
    },

    afterRender: function() {
        this.callParent(arguments);
        this.refresh();
    },

    setValue: function(value) {
        this.value = value;
        this.refresh();
    },

    refresh: function() {
        if (this.rendered) {
            var ratio = Math.round(this.value / this.max * 100);
            this.el.down('.value').update('' + ratio);
            this.el.down('.bar div').setWidth('' + ratio + '%');

            var redMax = 100 - this.criticalLevel;
            var redLevel = ratio - this.criticalLevel;
            if (redLevel > 0) {
                var redFactor = Math.pow(redLevel / redMax, this.criticalCurve) * 255;
                var color = new Ext.draw.Color(redFactor, 0, 255 - redFactor);
                this.el.down('.bar div').applyStyles({'background-color': color});
            }
        }
    }
});
