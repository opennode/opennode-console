/**
 * @class Ext.ux.LiveSearchGridPanelEx
 * @extends Ext.grid.Panel
 * <p>A GridPanel class with live search support.</p>
 * @author Nicolas Ferrero
 * 
 * Pedro Agullo: changed to support having a RowExpander plugin and
 *               less frequent updates, because when there are many records
 *               in store, search is very slow and not user friendly 
 */
Ext.define('Ext.ux.LiveSearchGridPanelEx', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Ext.toolbar.TextItem',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Text',
        'Ext.ux.statusbar.StatusBar'
    ],
    
    /**
     * @private
     * search value initialization
     */
    searchValue: null,
    
    /**
     * @private
     * The row indexes where matching strings are found. (used by previous and next buttons)
     */
    indexes: [],
    
    /**
     * @private
     * The row index of the first search, it could change if next or previous buttons are used.
     */
    currentIndex: null,
    
    /**
     * @private
     * The generated regular expression used for searching.
     */
    searchRegExp: null,
    
    /**
     * @private
     * Case sensitive mode.
     */
    caseSensitive: false,
    
    /**
     * @private
     * Regular expression mode.
     */
    regExpMode: false,
    
    /**
     * @cfg {String} matchCls
     * The matched string css classe.
     */
    matchCls: 'x-livesearch-match',
    
    defaultStatusText: 'Nothing Found',
    
    // Component initialization override: adds the top and bottom toolbars and setup headers renderer.
    initComponent: function() {
        var me = this;

        // Need this so that parent can 'inject' items in toolbar
         me.tbar = ['Search',{
                 xtype: 'textfield',
                 name: 'searchField',
                 hideLabel: true,
                 width: 200,
                 enableKeyEvents:true,
                 listeners: {
                     change: {
                         fn: me.onTextFieldChange,
                         scope: this,
                         // PAG: RowExpander plugin handling
                         //      When there are many rows, searches are slow
                         //      and it is better to launch them less often
                         buffer: 600 
                         // buffer: 100
                     },
                     specialKey: function(field, e) {
                        if (e.getKey() === e.ENTER) {
                           me.onTextFieldChange();
                        }
                     }
                 }
            }, {
                xtype: 'button',
                
                // PAG: enhance look
                iconCls: 'sm-livesearch-prev',
                //text: '&lt;',
                   
                tooltip: 'Find Previous Row',
                handler: me.onPreviousClick,
                scope: me
            },{
                xtype: 'button',
                
                // PAG: enhance look
                iconCls: 'sm-livesearch-next',
                // text: '&gt;',
                   
                tooltip: 'Find Next Row',
                handler: me.onNextClick,
                scope: me
            }, '-', {
                xtype: 'checkbox',
                hideLabel: true,
                margin: '0 0 0 4px',
                handler: me.regExpToggle,
                scope: me                
            }, 'Regular expression', {
                xtype: 'checkbox',
                hideLabel: true,
                margin: '0 0 0 4px',
                handler: me.caseSensitiveToggle,
                scope: me
            }, 'Case sensitive'];

        // PAG: this helps inject things in this statusbar, instead
        // of having to add another bar for global buttons such as 'clear'
        Ext.apply( me.bbar, {
           xtype : 'statusbar',
           defaultText : me.defaultStatusText,
           name: 'searchStatusBar'
        });
        
        me.callParent(arguments);
    },
    
    // afterRender override: it adds textfield and statusbar reference and start monitoring keydown events in textfield input 
    afterRender: function() {
        var me = this;
        me.callParent(arguments);
        me.textField = me.down('textfield[name=searchField]');
        me.statusBar = me.down('statusbar[name=searchStatusBar]');
    },
    // detects html tag
    tagsRe: /<[^>]*>/gm,
    
    // DEL ASCII code
    tagsProtect: '\x0f',
    
    // detects regexp reserved word
    regExpProtect: /\\|\/|\+|\\|\.|\[|\]|\{|\}|\?|\$|\*|\^|\|/gm,
    
    /**
     * In normal mode it returns the value with protected regexp characters.
     * In regular expression mode it returns the raw value except if the regexp is invalid.
     * @return {String} The value to process or null if the textfield value is blank or invalid.
     * @private
     */
    getSearchValue: function() {
        var me = this,
            value = me.textField.getValue();
            
        if (value === '') {
            return null;
        }
        if (!me.regExpMode) {
            value = value.replace(me.regExpProtect, function(m) {
                return '\\' + m;
            });
        } else {
            try {
                new RegExp(value);
            } catch (error) {
                me.statusBar.setStatus({
                    text: error.message,
                    iconCls: 'x-status-error'
                });
                return null;
            }
            // this is stupid
            if (value === '^' || value === '$') {
                return null;
            }
        }

        return value;
    },
    
    // PAG: to alleviate search wait we have wrapped the search
    //      with a wait message + masking
    onTextFieldChange: function() {
       var me = this, waitMsg;
       
       records = me.store.getCount();
       if( records > 150 ) {
          waitMsg = "Searching among " + me.getStore().getCount() +  
                    " records.</p>Please, wait...";
       }
       /*
       else {
          waitMsg = "Searching...";
          waiting = true;
       }
       */
       if( waitMsg ) {
          Ext.getBody().mask( waitMsg, 'x-mask-loading');
       }
       // We defer search start in order to let the message appear, or
       // else we will never see it
       Ext.defer( function() {
           me.onTextFieldChange2();
           if( waitMsg ) {
              Ext.getBody().unmask();
           }
       }, 50);
       
    },
    
    /**
     * Finds all strings that matches the searched value in each grid cells.
     * @private
     */
     onTextFieldChange2: function() {
         var me = this,
             count = 0;

         me.view.refresh();
         // reset the statusbar
         me.statusBar.setStatus({
             text: me.defaultStatusText,
             iconCls: ''
         });

         me.searchValue = me.getSearchValue();
         me.indexes = [];
         me.currentIndex = null;

         if (me.searchValue !== null) {
             me.searchRegExp = new RegExp(me.searchValue, 'g' + (me.caseSensitive ? '' : 'i'));
             
             var hasRowExpanderPlugin = me.getPlugin('') 
             me.store.each(function(record, idx) {
                 var td = Ext.fly(me.view.getNode(idx)).down('td'),
                     cell, matches, cellHTML;
                 // PAG: RowExpander plugin handling.
                 if( me.hasRowExpanderPlugin) {
                    td = td.down('td'); 
                 }
                 
                 while(td) {
                     cell = td.down('.x-grid-cell-inner');
                     
                     // PAG: If RowExpander plugin is present
                     if( me.hasRowExpanderPlugin && !cell) {
                        cell = td.down('.x-grid-rowbody');
                     }
                     
                     matches = cell.dom.innerHTML.match(me.tagsRe);
                     cellHTML = cell.dom.innerHTML.replace(me.tagsRe, me.tagsProtect);
                     
                     // populate indexes array, set currentIndex, and replace wrap matched string in a span
                     cellHTML = cellHTML.replace(me.searchRegExp, function(m) {
                        count += 1;
                        if (Ext.Array.indexOf(me.indexes, idx) === -1) {
                            me.indexes.push(idx);
                        }
                        if (me.currentIndex === null) {
                            me.currentIndex = idx;
                        }
                        return '<span class="' + me.matchCls + '">' + m + '</span>';
                     });
                     // restore protected tags
                     Ext.each(matches, function(match) {
                        cellHTML = cellHTML.replace(me.tagsProtect, match); 
                     });
                     // update cell html
                     cell.dom.innerHTML = cellHTML;
                     
                     // PAG: now, we need to find the td for the expanded
                     //      row, if it is there
                     if( me.hasRowExpanderPlugin && !td.next() ) {
                        // We try to find the tr following the parent tr,
                        // as it might be the expanded view row. If present
                        // we set the td to its only td, so the iteration
                        // can follow unchanged
                        var newTd = td;
                        newTd = newTd.up('tr').next();
                        if( newTd ) {
                           newTd = newTd.down('td');
                        }
                        if( newTd ) {
                           td = newTd;
                           continue;
                        }
                     }

                     td = td.next();
                 }
             }, me);

             // results found
             if (me.currentIndex !== null) {
                 me.getSelectionModel().select(me.currentIndex);
                 me.statusBar.setStatus({
                     text: count + ' matche(s) found.',
                     iconCls: 'x-status-valid'
                 });
             }
         }

         // no results found
         if (me.currentIndex === null) {
             me.getSelectionModel().deselectAll();
         }

         // force textfield focus
         me.textField.focus();
     },
    
    /**
     * Selects the previous row containing a match.
     * @private
     */   
    onPreviousClick: function() {
        var me = this,
            idx;
            
        if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx - 1] || me.indexes[me.indexes.length - 1];
            me.getSelectionModel().select(me.currentIndex);
         }
    },
    
    /**
     * Selects the next row containing a match.
     * @private
     */    
    onNextClick: function() {
         var me = this,
             idx;
             
         if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx + 1] || me.indexes[0];
            me.getSelectionModel().select(me.currentIndex);
         }
    },
    
    /**
     * Switch to case sensitive mode.
     * @private
     */    
    caseSensitiveToggle: function(checkbox, checked) {
        this.caseSensitive = checked;
        this.onTextFieldChange();
    },
    
    /**
     * Switch to regular expression mode
     * @private
     */
    regExpToggle: function(checkbox, checked) {
        this.regExpMode = checked;
        this.onTextFieldChange();
    }
});