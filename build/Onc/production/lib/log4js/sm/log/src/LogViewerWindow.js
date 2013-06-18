/*
 * Copyright © 2012 Pedro Agullo Soliveres.
 * 
 * This file is part of Log4js-ext.
 *
 * Log4js-ext is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * Commercial use is permitted to the extent that the code/component(s)
 * do NOT become part of another Open Source or Commercially developed
 * licensed development library or toolkit without explicit permission.
 *
 * Log4js-ext is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Log4js-ext.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * This software uses the ExtJs library (http://extjs.com), which is 
 * distributed under the GPL v3 license (see http://extjs.com/license).
 */

/*jslint strict:false */

(function() {
   // "use strict"; //$NON-NLS-1$

   // ******************************************
   // Special sorting for priority/level column
   // Need to define it here before using the type in the LoggingEvent model
   Ext.data.Types.LOGLEVEL = {
      convert: function(v, n) {
         return v;
      },
      sortType: function(v) {
         return Sm.log.Level.getLevelLevel(v);
      },
      type: 'LOGLEVEL'
   };            

   Ext.define('Sm.log.viewer.LoggingEvent', {
      extend: 'Ext.data.Model',
      fields: [
          // {name: 'time'}, // We don't use this
          // {name: 'message'}, // We don't use this
          {name: 'hasLoggedObject'},
          {name: 'formattedTime'},
          {name: 'level', type: Ext.data.Types.LOGLEVEL},
          {name: 'category'},
          {name: 'formattedMessage'},
          {name: 'formattedLoggedObject'},
          {name: 'ndc'},

          {name: 'formattedMultilineMessage'},
          {name: 'formattedMultilineLoggedObject'}
      ]
   });
   
   Ext.define('Sm.log.viewer.Level', {
      extend: 'Ext.data.Model',
      fields: [
          {name: 'level',  type: 'int'},
          {name: 'name', type: 'string'},
          {name: 'iconClass', type: 'string'}
      ]
   });
   
   /**
    * A window that can receive log data.
    * 
    * This window provides support viewing log details, sorting, filtering, 
    * a detail view for large logs, and nice JSON formatting for logged objects.
    * 
    * {@img log-viewer-window.png alt text}
    * 
    */
   Ext.define('Sm.log.LogViewerWindow', { //$NON-NLS-1$
      extend : 'Ext.window.Window',

      uses : ['Ext.ux.grid.plugin.RowExpander', 
              'Ext.ux.LiveSearchGridPanelEx', 

              'Ext.String',
              'Ext.Array',
              'Ext.form.Panel',
              'Ext.grid.Panel',
              'Ext.data.ArrayStore',
              'Ext.ux.statusbar.StatusBar',
              'Sm.log.Level',
              'Sm.log.LogViewerAppender'],
             
      layout: 'border',
      
      title: 'Log viewer', // Can use span here, or it bombs in some contexts 
                    // (though not in examples)

      resizable: true,
      itemId :'windowCId',
      iconCls : 'sm-log-viewer-icon',
      maximizable: true,
         
      width : 950,
      height: 400,

      formPadding : 5,
      
      gridCfg : {
         xtype: 'grid',
         itemId : 'gridCId',
         region: 'center',
         border: false,
         autoScroll: true, 
         multiSelect : false,
         disableSelection: false, // We need this, or bad things will happen
         loadMask: true, 
         viewConfig: {
            emptyText : "No logs", 
            stripeRows: false
         },
         columns : [
            { dataIndex: 'formattedTime', text: 'Time', width: 140 },
            { dataIndex: 'level', 
              text: '<span data-qtip="Priority">P.</span>', width: 30,
              renderer: function (value) {
                 var result, level;
                 value = value.toLowerCase();                 
                 result = '<div  data-qtip="' + Ext.String.capitalize(value) +
                              '" class="sm-log-level-' + 
                              value + '-icon" >' + 
                              '&nbsp;</div>';
                 return result;
              }
            },
            { dataIndex: 'category', text: 'Category', width: 150},
            { dataIndex: 'ndc', text: 'NDC', width: 50},
            { dataIndex: 'formattedMessage', text: 'Message', width: 300},
            { dataIndex: 'hasLoggedObject', 
               text: '<span data-qtip="Is there an attached logged object?">' +
                     'LO?</span>', 
               width: 30,
               renderer: function (value) {
                  var result = ' ';
                  if( value ) {
                    result = '<div  data-qtip="' +
                        'There is a logged object attached to this log entry' +
                        '" class="sm-log-has-logged-object-true" >' + 
                        '&nbsp;</div>';
                  }
                  return result;
               }
            },
            { dataIndex: 'formattedLoggedObject', 
              text: 'Logged Object', width: 500}
         ],
         plugins: [
            {
               pluginId: 'rowExpanderPId',
               ptype: 'dvp_rowexpander', // Uses Ext.ux.grid.plugin.RowExpander
               // ptype: 'rowexpander',  // Uses Ext.ux.RowExpander
               rowBodyTpl : [                          
                   '<p>' +
                   // Time, priority, category and NDC
                   '<b>Time</b>: {formattedTime}' +
                       '<b>&nbsp;&nbsp;&nbsp;&nbsp;Priority</b>: {level} ' +
                       '<b>&nbsp;&nbsp;&nbsp;&nbsp;Category</b>: {category} ' +
                       '<b>&nbsp;&nbsp;&nbsp;&nbsp;NDC</b>: {ndc}' +
                       '<br>' +
                   // Message: if formatted message has multiple lines, put it 
                   // in a different line
                   '<b>Message</b>: ' +
                   '<tpl if="formattedMultilineMessage != formattedMessage">' +
                      '<br>' +
                   '</tpl>' +
                   '{formattedMultilineMessage}' +
                   // Logged object: nothing, if there is no logged object
                   '<tpl if="hasLoggedObject">' +
                      '<br>' +
                      '<b>Logged Object</b>:' +
                      '<br>' +
                      '<p>{formattedMultilineLoggedObject}</p>' +
                   '</tpl>' +
                   '</p>'
               ]
            }
         ]
         
       },

      formCfg : {
         region: 'north',
         split: true, // In case of window resize, and form items 'moving down'
         autoScroll:true,
         itemId : 'formCId',
         xtype: 'form',
         layout: 'column',
         border : false,
         fieldDefaults : {
            selectOnFocus : true,
            msgTarget : 'side',
            autoFitErrors: true,
            labelAlign: 'right',
            validateOnChange : true,
            fieldLabel: '&nbsp;'
         },
         items : [
           {  xtype: 'combo', 
              name: 'filteringLevel',
              itemId : 'filteringLevelCId',
              valueField : 'level',
              displayField: 'name',
              width: 125, 
              labelWidth : 45,
              fieldLabel : 'Priority',
              allowBlank:false,
              autoSelect : true, 
              forceSelection: true,
              editable: false,
              typeAhead: false,

              listConfig: {
                 getInnerTpl: function() {
                     var tpl = '<div class="{iconClass}">{name}</div>';
                     return tpl;
                 }
             },


/*
              djnpInputTooltip: 
                     '<span class="search-field-info-tooltip"></span>' +
                     "We will show only logs with this or greater priority",
*/
              listeners : {
                 change : {
                    fn: function() {
                       var win = this.up( '.window' );
                       if( this.isValid() ) {
                          win.applyFilter();
                       }
                    },
                    buffer: 250
                 }
              }
           },
           {  xtype: 'textfield', 
              name: 'filteringCategory',
              labelWidth: 60,
              width: 170,
              fieldLabel: 'Category',
              vtype: 'emptyOrLengthGreaterThan1',
/*
              djnpInputTooltip : {
                 html : 
                    '<span class="search-field-info-tooltip"></span>' +
                    "We will look for the entered value <b>anywhere</b> " +
                    "in the category"
              },
*/
              listeners : {
                 change : {
                    fn: function() {
                       var win = this.up( '.window' );
                       if( this.isValid() ) {
                          win.applyFilter();
                       }
                    },
                    buffer: 250
                 }
              }              
           },
           // @todo: almost cut and paste from above, refactor
           {  xtype: 'textfield', 
              name: 'filteringFormattedMessage',
              labelWidth: 60,
              width: 170,
              fieldLabel: 'Message',
              vtype: 'emptyOrLengthGreaterThan1',

/*
              djnpInputTooltip : {
                 html : 
                    '<span class="search-field-info-tooltip"></span>' +
                    "We will look for the entered value <b>anywhere</b> " +
                    "in the message"
              },
*/
              listeners : {
                 change : {
                    fn: function() {
                       var win = this.up( '.window' );
                       if( this.isValid() ) {
                          win.applyFilter();
                       }
                    },
                    buffer: 250
                 }
              }              
           },
           {  xtype: 'textfield', 
              name: 'filteringNdc',
              labelWidth: 30,
              width: 130,
              fieldLabel: 'NDC',
              vtype: 'emptyOrLengthGreaterThan1',
/*
              djnpInputTooltip : {
                 html : 
                    '<span class="search-field-info-tooltip"></span>' +
                    "We will look for the entered value <b>anywhere</b> " +
                    "in the NDC"
              },
*/
              listeners : {
                 change : {
                    fn: function() {
                       var win = this.up( '.window' );
                       if( this.isValid() ) {
                          win.applyFilter();
                       }
                    },
                    buffer: 250
                 }
              }              
           },
           {  xtype: 'textfield', 
              name: 'filteringFormattedLoggedObject',
              labelWidth: 90,
              width: 190,
              fieldLabel: 'Logged object',
              vtype: 'emptyOrLengthGreaterThan1',

/*
              djnpInputTooltip : {
                 html : 
                    '<span class="search-field-info-tooltip"></span>' +
                    "We will look for the entered value <b>anywhere</b> " +
                    "in the logged object"
              },
*/
              listeners : {
                 change : {
                    fn: function() {
                       var win = this.up( '.window' );
                       if( this.isValid() ) {
                          win.applyFilter();
                       }
                    },
                    buffer: 250
                 }
              }              
           }
           
         ]
      }, 
      
      listeners : {
         destroy : function() {
            this.detachLogAppender(true);
         }         
      },
      
      items :[
      ],
      
      applyFilter : function() {
         var me = this;
         // Need to restore store to 'non-filtered', and then filter it again
         // using our filters
         me.store.clearFilter(true);
         me.store.filter( function(item) {
            var ok = me.filterByLevel(item) &&
                     me.filterByCategory(item) &&
                     me.filterByMessage(item) &&
                     me.filterByNdc(item) && 
                     me.filterByLoggedObject(item);
            return ok;
         });
      },
            
      filterByLevel : function( item ) {
         var me = this, minLevel, thisLevel, thisLevelText;
         
         if( !me.filteringLevel || !me.filteringLevel.rendered) {
            return true;
         }
         
         minLevel = me.filteringLevel.getValue();
         
         // @todo, why not have numeric level.level in model?
         thisLevelText = item.get("level");
         Sm.log.util.Assert.assert(thisLevelText);
         thisLevel = Sm.log.Level.getLevelLevel(thisLevelText);
         return thisLevel >= minLevel;
      },

      filterByStringFieldWithText : function( item, modelField, formField,
               blankModelFieldIsOk, caseSensitive) {
         var field, value, modelValue, found;
         field = this.form.findField( formField);
         Sm.log.util.Assert.assert(field);
         value = field.getValue(); 
         
         // If no filter, the record is in
         if( value === '' ) {
            return true;
         }
         modelValue = item.get(modelField);
         Sm.log.util.Assert.assert( Ext.isString(modelValue));
         
         // Sometimes we decide that an empty model value is ignored at
         // filtering time and then the record is in
         if( modelValue === '' && blankModelFieldIsOk) {
            return true;
         }         
         Sm.log.util.Assert.assert(modelValue || modelValue === '');
         
         // If the text is anywhere in the model value, then there is a 
         // match. Take case sensitivity into account
         if( !caseSensitive ) {
            modelValue = modelValue.toUpperCase();
            value = value.toUpperCase();
         }
         found = modelValue.indexOf(value) >= 0;
         
         return found;
      },
      
      filterByCategory : function(item) {
         return this.filterByStringFieldWithText(
                  item, "category", 'filteringCategory' );
      },
  
      filterByMessage : function(item) {
         return this.filterByStringFieldWithText(
                  item, "formattedMessage", 'filteringFormattedMessage' );
      },
      
      filterByNdc : function(item) {
         return this.filterByStringFieldWithText(
                  item, "ndc", 'filteringNdc' );
      },
      
      filterByLoggedObject : function(item) {
         return this.filterByStringFieldWithText( item,
                  "formattedLoggedObject", 'filteringFormattedLoggedObject' );
      },
            
      initComponent : function(cfg) {
         var me = this, levelToStoreData, levelsData, 
             filteringLevelCfg, bottomButtonsContainer, pad;
         
         this.useLiveSearch = false;

         // ******************************************
         // Special validation
         Ext.form.field.VTypes.emptyOrLengthGreaterThan1 = function(v) {
            if( !v) {
               return false;
            }
            Sm.log.util.Assert.assert(Ext.isString(v));
            return v.length > 1;
         };
         Ext.form.field.VTypes.emptyOrLengthGreaterThan1Text = 
            'Must be empty or have more than one character';
         
         // *****************************************
         // Configure store
         me.store = Ext.create('Ext.data.ArrayStore', 
                  {model: 'Sm.log.viewer.LoggingEvent',
                   sorters: [{property: 'formattedTime', direction: 'DESC'}]});
         
         // *****************************************
         // Configure grid
         me.gridCfg.store = me.store;
         me.gridCfg.searchOnCriteriaChange = true;
         Ext.Array.forEach( me.gridCfg.columns, function(column) {
            column.style = { fontWeight : 'bold'};
         });
         
         if( this.useLiveSearch ) {
            me.gridCfg.bbar = me.gridCfg.bbar || {};
            me.gridCfg.bbar.items = me.gridCfg.items || [];
            bottomButtonsContainer = me.gridCfg.bbar;
         }
         else {
            bottomButtonsContainer = { xtype : 'statusbar', 
                                       dock: 'bottom', items: []};
            me.gridCfg.dockedItems =[bottomButtonsContainer];
         }

         Ext.Array.push( bottomButtonsContainer.items, [
/*
          { xtype : 'button',
            text :'Fake: generate logs',
            handler : function() {
               var win = this.up( '.window' );
               win.generateFakeEvents( 1000);
            }
          },
*/
          { xtype: 'button',
            text: 'Clear logs',
            tooltip: 'Clears current logs as well as buffered logs',
            handler : function() {
               var win = this.up( '.window' );
               win.clearLog();
            }
          },
          {  xtype: 'button',
             itemId : 'stateCId',
             tooltip: 'Sets state to Logging/Buffering logs/Stopped',
             menu: {
                items: [
                    { text: 'Log', 
                      iconCls : 'sm-log-state-logging',
                      tooltip: 'Starts/restarts logging' +
                               '<p/>&nbsp;<p/>' +
                               'Shows incoming logs as they arrive: ' +
                               'when set, will show all buffered logs ' +
                               'that were pending',
                      handler: function() {
                         var win = this.up( '.window' );
                         win.startLogging();
                      }
                    },
                    {  text: 'Buffer new logs',                       
                       tooltip: 
                          'Buffers incoming logs' +
                          '<p/>&nbsp;<p/>' +
                          'Buffered logs will be added to the window ' +
                          'when logging state is set to ' +
                          'logging again: ' +
                          'they will not be lost.' +
                          '<p/>&nbsp;<p/>' +
                          'This might be useful to avoid ' +
                          'interferences during debug due to the ' +
                          'logging window being updated during logging.',
                       iconCls : 'sm-log-state-buffering',
                       handler: function() {
                          var win = this.up( '.window' );
                          win.bufferLogging();
                       }
                     },
                     { text: 'Stop logging',
                        tooltip: 'Stops logging: incoming will be lost',
                        iconCls : 'sm-log-state-stopped',
                        handler: function() {
                           var win = this.up( '.window' );
                           win.stopLogging();
                        }
                     }
                ]
             }          
           }
         ]);

         if( this.useLiveSearch ) {
            me.grid = Ext.create('Ext.ux.LiveSearchGridPanelEx', me.gridCfg );
            me.grid.hasRowExpanderPlugin =  
               me.grid.getPlugin( 'rowExpanderPId' );
         }
         else {
            me.grid = Ext.create('Ext.grid.Panel', me.gridCfg );
         }
         
         // ******************************************
         // Configure form
         pad = me.formPadding;
         me.formCfg.bodyPadding = pad +", " + pad+ ", 0, 0";
         me.formCfg.defaults = me.formCfg.defaults || {};
         me.formCfg.defaults.style = {
                  marginBottom: ' ' + pad + 'px', // The 'px' is *needed*
                  marginLeft: ' ' + pad + 'px' // The 'px' is *needed*
         };
         
         filteringLevelCfg = me.formCfg.items[0];
         Sm.log.util.Assert.assert( filteringLevelCfg.name === 
                                    'filteringLevel');
         filteringLevelCfg.value = Sm.log.Level.TRACE.getLevel();
         me.items = [
            me.formCfg,
            me.grid
         ];         
         
         me.callParent(arguments);
        
         me.grid = me.down( "#gridCId");
         Sm.log.util.Assert.assert( me.grid);
         
         me.formPanel = me.down( "#formCId");         
         Sm.log.util.Assert.assert( me.formPanel);
         me.form = me.formPanel.getForm();
         Sm.log.util.Assert.assert( me.form);
         
         
         me.stateButton = me.down( "#stateCId" );            
         Sm.log.util.Assert.assert( me.stateButton);

         me.filteringLevel = me.down( "#filteringLevelCId");
         Sm.log.util.Assert.assert( me.filteringLevel);
         levelToStoreData = function ( level ) {
            // Unfortunately an ArrayStore can't cope with model objects,
            // but rather we must turn them into an array :(
            var text= level.name, iconClass = 
               'sm-log-level-' + text.toLowerCase() + '-icon';
            /*
            return new Sm.log.viewer.Level( 
                     { level: level.level, name: text, 
                       iconClass: iconClass});
            */
            // Items in array *MUST* have the same order than fields in model!!
            return [level.getLevel(), level.getName(), iconClass];
          };

         levelsData =  
            [levelToStoreData( Sm.log.Level.FATAL),
             levelToStoreData( Sm.log.Level.ERROR),
             levelToStoreData( Sm.log.Level.WARN),
             levelToStoreData( Sm.log.Level.INFO),
             levelToStoreData( Sm.log.Level.DEBUG),
             levelToStoreData( Sm.log.Level.TRACE)];
          
         me.filteringLevel.bindStore( Ext.create('Ext.data.ArrayStore', 
            { model: 'Sm.log.viewer.Level', autoLoad:true,
              data: levelsData
         }));
         me.filteringLevel.setValue(Sm.log.Level.TRACE.getLevel());
                 
         
         me.on( 'activate', function() {this.focustLastLogIfSortedByTime();}, 
                me, {single: true});
         
         // *****************************************************************
         // Delayed setup
         me.on( 'boxready', this.boxreadyInitialization, me);
       },

       boxreadyInitialization : function() {
          var me = this;

          // ****************************************************************
          // Attach appender, if it is there: else, create a new one
          if( !this.getAppender() ) {
             this.appender = new Sm.log.LogViewerAppender();
          }
          this.attachLogAppender( this.getAppender());

          // Believe it or not, assigning this to title directly bombs
          // in some cases (though not in our examples)
          me.setTitle(
                   '<a data-qtip="Click to visit log4js-ext website" ' +
                    'style="text-decoration: none" target="_new"' +
                    'href="http://code.google.com/p/log4js-ext/">' +
                   '<span class="sm-log-viewer-title-1">log4js</span>' +
                   '<span class="sm-log-viewer-title-2">-ext</span></a>' );
       },

       startLogging : function() {
          var me = this;
          Sm.log.util.Assert.assert(me.appender);
          
          if( me.appender.canLog() ) {
             this.updateState( 'Set logging state', 'Logging', 
                      'sm-log-state-logging');
             me.appender.startLogging();
             return true;
          } 
          return false;
       },
       
       stopLogging : function() {
          var me = this;
          Sm.log.util.Assert.assert(me.appender);
          
          this.updateState( 'Set logging state', 'Stopped', 
                   'sm-log-state-stopped');
          me.appender.stopLogging();
       },
       
       bufferLogging : function() {
          var me = this;
          Sm.log.util.Assert.assert(me.appender);
          
          this.updateState( 'Set logging state', 'Buffering', 
                   'sm-log-state-buffering');
          me.appender.startBuffering();
       },
       
       setNoAppenderAttachedState: function() {
          var me = this;
          Sm.log.util.Assert.assert( !this.getAppender() );
          this.updateState( 'Logging state: no appender attached', 
                                  'No appender attached',
                                   'sm-log-state-no-appender-attached', true);
       },
       
       updateState : function(text, tooltip, iconCls, disabled) {
          var me = this, stateIcon;
          disabled = disabled || false;
          
          
          this.stateButton.setText( text );
          this.stateButton.setDisabled(disabled);
          this.stateButton.setIconCls( iconCls );
          
          //this.logger.trace( 'Logging state changed. Text=' + text + 
          //                   ", IconCls=" + iconCls);
       },
       
       clearLog : function() {
          var me = this;
          me.store.removeAll();
          if( this.getAppender() ) {
             this.getAppender().clearBuffer();
          }
       },
       
       getAppender : function() {
          return this.appender;
       },
       
       attachLogAppender : function (appender) {
          var me = this;
          
          if( !appender ) {
             this.detachLogAppender(false);
          }
          else {
             me.appender = appender;
             me.appender.attachViewer( me );
             if( me.appender.canLog() ) {
                me.startLogging();
             }
             else {
                me.bufferLogging();
             }
          }
       },
       
       detachLogAppender : function(destroying) {
          if( this.appender ) {
             this.appender.detachViewer();
             this.appender = null;
             if( !destroying ) {
                this.setNoAppenderAttachedState();
             }
          }
       },
       
       appendLoggingEvents : function( loggingEvents ) {
          var me = this, row, gridView, loggingEvent, i ;

          for( i = 0; i < loggingEvents.length; i = i + 1 ) {
             loggingEvent = loggingEvents[i];
             me.store.add(new Sm.log.viewer.LoggingEvent(loggingEvent));
          }
          
          // If we don't reapply filters, then the new items are visible
          // even if they do not pass the filter criteria
          if( loggingEvents.length > 0) {
             me.applyFilter();
          }

          // Focus the last log 
          this.focustLastLogIfSortedByTime();
       },

       // @private
       // 
       // If sorted by time, we probably want to see things 'as they happen'
       // if that's the case, it is amazingly useful to position ourselves
       // in the last added log record, *without* losing the last selected
       // item, which can act like a 'I was here' mark.
       //
       // This is a very special case, but probably rather common and really
       // worth it when you are debugging :) 
       focustLastLogIfSortedByTime : function() {
          var me = this, row, gridView, 
              priorSelectedRows, oldSelection = null, 
              sorters, sorter;
          
          if( me.store.getCount() === 0 ) {
             return;
          }
          
          sorters = me.store.sorters;
          
          if( sorters.getCount() === 0 ) {
             return;
          }
     
          sorter = sorters.getAt(0);
          if( sorter.property !== 'formattedTime') {
             return;
          }
          
          if( sorter.direction.toUpperCase() === 'DESC') {
             row = 0;
          }
          else {
             row = me.store.getCount() - 1;
          }

          gridView = me.grid.getView();
          priorSelectedRows = gridView.getSelectionModel().getSelection();
          Sm.log.util.Assert.assert( priorSelectedRows.length <= 1);
          if( priorSelectedRows.length > 0) {
             oldSelection = priorSelectedRows[0];
          }
          gridView.focusRow(row);
          // If no old selection, we select last log: that way, when
          // we do more logs, we get visual feedback that there have 
          // been new log since the last time
          if( !oldSelection ) {
             gridView.getSelectionModel().select(row);
          }
       }
     
/*
       // @todo pag: remove this and its references
       generateFakeEvents : function (count ) {
          var result = [],
              levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"],
              li, i,
              ndc,
              ev;

          for( i = 1; i <= count; i = i + 1 ) {
             li = i % levels.length;
             if( i % 3 === 0) {
                ndc = "ndc ate " + ((i % 10) + 2);
             }
             else {
                ndc = "";
             }
             
             ev = {
                level : levels[li],
                ndc : ndc,
                formattedMessage : "This is message number " + i,
                category : "Category.cate " + i % 10,
                formattedTime : new Date( 1990 + i % 100, 
                                 (i % 10) + 1, (i % 25) + 1 ).toString() 
             };
             
             result.push(ev);
          }
          
          this.appendLoggingEvents(result);          
       }
*/
       
   });
}());