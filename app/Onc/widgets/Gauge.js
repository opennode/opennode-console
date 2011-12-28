Ext.define('Onc.widgets.Gauge', {
    extend: 'Ext.Component',
    alias: 'widget.gauge',

    cls: 'gauge',
    iconCls: null,

    width: 125,

    value: 0.0,
    max: 1.0,
    unit: null,
    criticalLevel: 0.00,
    criticalCurve: 0.05,
    alwaysFloat: false,

    tpl: new Ext.XTemplate(
        '<span>',
        '    <tpl if="label"><label>{label}</label></tpl> ',
        '    <span class="percentage"></span>%',
        '    of {[values._getMaxForDisplay()]}<tpl if="unit">{unit}</tpl>',
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
        if (this.border !== false)
            this.el.addCls('with-border');
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
            var ratio = (this.value / this.max).round(2);
            ratio = (isNaN(ratio) ? 0 : ratio);

            if (ratio > 1.0) {
                ratio = 1.0;
                this.el.down('.bar').addCls('overload');
            } else {
                this.el.down('.bar').removeCls('overload');
            }

            var ratioPercentage = (ratio * 100).round();
            this.el.down('.percentage').update('' + ratioPercentage);
            this.el.down('.bar div').setWidth('' + ratioPercentage + '%');

            this._doBgColor(ratio);
        }
    },

    _doBgColor: function(ratio) {
        var redMax = 1.0 - this.criticalLevel;
        var redLevel = ratio - this.criticalLevel;
        if (redLevel > 0) {
            var redFactor = Math.pow(redLevel / redMax, 100 * this.criticalCurve) * 255;
            var color = new Ext.draw.Color(redFactor, 0, 255 - redFactor);
            this.el.down('.bar div').applyStyles({'background-color': color});
        }
    },

    _getMaxForDisplay: function() {
        return (this.alwaysFloat && this.max % 1 === 0 ?
                "" + this.max + ".0"
                : this.max);
    }
});
