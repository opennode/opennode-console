Ext.define('opennodeconsole.widgets.Gauge', {
    extend: 'Ext.Component',
    alias: 'widget.gauge',
    requires: ['Ext.XTemplate'],

    cls: 'gauge',
    iconCls: null,

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
        if (this.iconCls) {
            this.el.addCls(this.iconCls);
            this.el.addCls('with-icon');
        }
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
