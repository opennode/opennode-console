/**
* A plugin that augments the Ext.ux.RowExpander to support clicking the header to expand/collapse all rows.
*
* Notes:
*
* - Compatible with Ext 4.1
*
* Example usage:
var grid = Ext.create('Ext.grid.Panel',{
plugins: [{
ptype: 'dvp_rowexpander'
,pluginId: 'xpander'
}]
...
});
grid.getPlugin('xpander').collapseAll();

*
* @author $Author: pscrawford $
* @version $Rev: 11106 $
* @date $Date: 2012-03-01 15:07:45 -0700 (Thu, 01 Mar 2012) $
* @license Licensed under the terms of the Open Source [LGPL 3.0 license](http://www.gnu.org/licenses/lgpl.html). Commercial use is permitted to the extent that the code/component(s) do NOT become part of another Open Source or Commercially licensed development library or toolkit without explicit permission.
* @constructor
* @param {Object} config
* 
* https://github.com/zombeerose/RowExpander
*/
Ext.define('Ext.ux.grid.plugin.RowExpander', {
    alias: 'plugin.dvp_rowexpander',
    extend: 'Ext.ux.RowExpander',
    
    
    //configurables
    /**
* @cfg {String} collapseAllCls
*/
    collapseAllCls: 'rowexpand-collapse-all',
    /**
* @cfg {String} collapseAllTip
*/
    collapseAllTip: 'Collapse all rows',
    /**
* @cfg {String} expandAllCls
*/
    expandAllCls: 'rowexpand-expand-all',
    /**
* @cfg {String} expandAllTip
*/
    expandAllTip: 'Expand all rows',
    /**
* @cfg {String} headerCls
*/
    headerCls: 'rowexpand-header',
    
    //properties
    
    //private
    constructor: function(){
        var me = this;

        me.callParent(arguments);

        /**
* @property toggleAllState
* @type {Boolean}
* Signifies the state of all rows expanded/collapsed.
* False is when all rows are collapsed.
*/
        me.toggleAllState = false;
    },//eof constructor
    
    /**
* @private
* @param {Ext.grid.Panel} grid
*/
    init: function(grid) {
        var me = this,
            col;
        
        me.callParent(arguments);
        
        col = grid.headerCt.getComponent(0); //assumes 1st column is the expander
        col.on('headerclick',me.onHeaderClick,me);
        col.on('render',me.onHeaderRender,me);
    }, // eof init

    /**
* @private
* @return {Object}
*/
    getHeaderConfig: function(){
        var me = this,
            config = me.callParent(arguments);
        
        Ext.apply(config,{
            cls: (config.cls || '') + ' ' + me.headerCls
        });
        return config;
    },
    
    /**
* Collapse all rows.
*/
    collapseAll: function(){
        this.toggleAll(false);
    },
    
    /**
* Expand all rows.
*/
    expandAll: function(){
        this.toggleAll(true);
    },
    
    /**
* @private
* @param {Ext.grid.header.Container} header
* @param {Ext.grid.column.Column} column
* @param {Ext.EventObject} e
* @param {HTMLElement} t
*/
    onHeaderClick: function(ct,col){
        var me = this,
            el = col.textEl;
        
        if (me.toggleAllState){
            me.collapseAll();
            el.replaceCls(me.collapseAllCls,me.expandAllCls);
        } else {
            me.expandAll();
            el.replaceCls(me.expandAllCls,me.collapseAllCls);
        }
        me.toggleAllState = !me.toggleAllState;
    }, //eof onHeaderClick
    
    /**
* @private
* @param {Ext.grid.column.Column} column
*/
    onHeaderRender: function(col){
        col.textEl.addCls(this.expandAllCls);
    },
    
    /**
* @private
* @param {Boolean} expand True to indicate that all rows should be expanded; false to collapse all.
*/
    toggleAll: function(expand){
        var me = this,
            ds = me.getCmp().getStore(),
            recs = ds.data.items,
            r = 0,
            l = recs.length,
            record;

        //switch to for loop vs ds.each() for perf - avoids the indexOf call
        for (; r < l; r++){
            record = recs[r];
            if (me.recordsExpanded[record.internalId] !== expand){
                me.toggleRow(r);
            }
        }
    }
    
});