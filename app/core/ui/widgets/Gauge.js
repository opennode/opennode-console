Ext.define('Onc.core.ui.widgets.Gauge', {
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
	lastUpdated: new Date(0),
	secondsAllowed: 10,
	firstDataReceived: false,
    // This must be either ['fixed', _] or ['precision', _] where _ is
    // an integer between 1 and 21 incl:
    display: null,
    defaultDisplay: ['fixed', 0],

    convert: function(v) { return v; },

    tpl: new Ext.XTemplate(
        '<span>',
        '    <tpl if="label"><label>{label}</label></tpl> ',
        '    <tpl if="max"><span class="percentage"></span>% /</tpl>',
        '    <span class="value"></span><tpl if="max"> of {[values._formatValue(values.max)]}</tpl><tpl if="unit"><b>{unit}</b></tpl>',
        '</span>',
        '<div class="bar"><div></div></div>'
    ),

	initComponent : function() {
		Ext.TaskManager.start({
			run : this._checkForFailure,
			scope : this,
			interval : 1000 * this.secondsAllowed
		});
		this.callParent();
	},

    onRender: function() {
    	this._checkForFailure();//Check data do dim 0 values at render
        this.callParent(arguments);
        this.tpl.overwrite(this.el, this);
        if (this.iconCls) {
            this.el.addCls(this.iconCls);
            this.el.addCls('with-icon');
        }
        if (this.border !== false)
            this.el.addCls('with-border');
    },

    listeners: {
        'afterrender': function(cmp, eOpts ){
            this.refresh();
        },
    },

    setValue: function(value) {
        this.value = value;
        this.lastUpdated = new Date();
        this.refresh();
    },

    refresh: function() {
        if (this.rendered) {
        	this._dimGauge(false);
            var ratio = (this.value / this.max).round(2);
            ratio = (isNaN(ratio) ? 0 : ratio);

            if (ratio > 1.0) {
                ratio = 1.0;
                this.el.down('.bar').addCls('overload');
            } else {
                this.el.down('.bar').removeCls('overload');
            }

            var ratioPercentage = (ratio * 100).round();
            this.el.down('.value').update(this._formatValue(this.value));
            if (this.el.down('.percentage'))
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

    _formatValue: function(value) {
        if (value === undefined) return value;
        value = this.convert(value);
        var display = this.display || this.defaultDisplay;
        return value['to' + display[0].capitalize()](display[1]);
    },
    _dimGauge : function(doIt) {
		if (doIt) {
			this.el.addCls('problem');
		} else {
			this.el.removeCls('problem');
		}
	},
	_checkForFailure : function() {
		if (!this.firstDataReceived && this.value==0.0) //this is here because 0 values are sent when opening compute, even if metrics are disabled 
			this.lastUpdated=new Date(0);
		else 
			this.firstDataReceived = true;
		
		var now = new Date();
		var sec = 1000;
		var diff = (now.getTime() - this.lastUpdated.getTime()) / (sec);
		if (diff >= this.secondsAllowed)
			this._dimGauge(true);
		else
			this._dimGauge(false);

	}
});
