/**
 * Classes purpose is to be always shown Tip, but because of getting anchor XY without mouse event. 
 * For now it's extentsion to offset Tip both x and y axis
 */

Ext.define('Onc.core.ui.widgets.StaticTip', {
    extend: 'Ext.tip.ToolTip',
    alias: 'widget.statictip',
    alternateClassName: 'Ext.StaticTip',
   
    offsetX:0,
    offsetY:0,
   
    // @private
    getOffsets: function() {

        var me = this,
            offsets;
        offsets = me.callParent();
        offsets[0] = offsets[0]+this.offsetX;
        offsets[1] = offsets[1]+this.offsetY;
        return offsets;
    },

});