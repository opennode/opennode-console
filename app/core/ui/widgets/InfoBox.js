Ext.define('Onc.core.ui.widgets.InfoBox', {
    extend: 'Ext.Component',
    alias: 'widget.infobox',

    cls: 'infobox',

    border: true,
    width: 95,
    hight: 95,
    
    value: 0,
    title: '',
    sub1_value: 0,
    sub1_title: '',
    sub2_value: 0,
    sub2_title: '',
    unit:'',
   
    display: null,
    defaultDisplay: ['fixed', 0],

    convert: function(v) { return v; },
    
    _formatValue: function(value) {
        if (value === undefined) return value;
        value = this.convert(value);
        var display = this.display || this.defaultDisplay;
        return value['to' + display[0].capitalize()](display[1]);
    },
    /**
     * Resizes formatted values div font-size to fit value in box.
     * 
     */
    _resizeValuesFontSize:function() {
        var el=this.el.down('.ib_main div');
        var value=this._formatValue(this.value).toString()
        var size=parseInt(el.getStyle('font-size'));
        var newSize=size - (value.length-1) * size  * 0.08;
        el.setStyle('font-size', Math.round(newSize)+"px");
    },
    
    tpl: new Ext.XTemplate('<div class="ib_header"><div>{title}</div></div>', '<div class="ib_main"><div> {[values._formatValue(values.value)]}<span>{unit}</span></div></div>',
                    '<div class="ib_footer"><tpl if="sub1_title"><div class="ib_f_left"><span class="ib_bold_nr">{sub1_value}</span><span>{sub1_title}</span></div></tpl><tpl if="sub2_title"><div class="ib_f_right"><span class="ib_bold_nr">{sub2_value}</span><span>{sub2_title}</span></div></tpl></div>'),

    initComponent: function() {
        this.callParent();
    },

    onRender: function() {
        this.callParent(arguments);
    },

    listeners: {
        'afterrender': function(cmp, eOpts) {
            this.refresh();
        },
    },
    /*
     * Give object with key:value pairs
     * {title: "new title"} 
     */
    updateData: function(data) {
        Ext.iterate(data, function(key, value) {
            this[key] = value;
        }.bind(this));
        this.refresh();
    },

    refresh: function() {
        if (this.rendered) {
            this.tpl.overwrite(this.el, this);
            this._resizeValuesFontSize();
        }
    },
});
