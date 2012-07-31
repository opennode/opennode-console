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

(function() {
   "use strict"; //$NON-NLS-1$

   /**
    * Base class for appenders.
    * 
    * An appender outputs logging information somewhere: a window, the browser 
    * console, even a remote system that knows how to process it.
    * 
    * The predefined {@link Sm.log.ExtLogAppender} outputs log information 
    * to the browser console, whereas {@link Sm.log.LogViewerAppender} 
    * outputs logs to a built-in window.
    * 
    * @abstract
    */
   Ext.define('Sm.log.AppenderBase', { //$NON-NLS-1$
      
      uses : ['Sm.log.util.Debug',
              'Sm.log.util.Assert',
              'Sm.log.TemplateLayout'],
      
      statics : {
         /**
          * @property
          * In this state the appender ignores all logs 
          * it receives. Incoming logs are lost.
          * 
          * @readonly
          * @static
          */
         STOPPED : 'Stopped', 
         /**
          * @property
          * In this state the appender keeps buffering logs.
          * 
          * Logs will not be lost, they will sent to its destination 
          * when the appender state changes to LOGGING.
          * 
          * @readonly
          * @static
          */
         BUFFERING : 'Buffering',
         /**
          * @property
          * In this state the appender outputs logs as they arrive.
          * 
          * @readonly
          * @static
          */
         LOGGING : 'Logging' 
      },

      config : {
         /**
          * @cfg
          * @accessor
          * 
          * A list with the EventLogging properties for which to call
          * Ext.util.Format.htmlEncode before logging them.
          *  
          * This is important if the output will go to html, you
          * are using special html characters, and you want these 
          * characters to be shown as-is. 
          */
         htmlEncodedLogEventProperties : []
      },
      
      
      /**
       * Writes the log data
       * 
       * @protected
       * @abstract 
       * @param {Sm.log.LoggingEvent} logEvent 
       * 
       * @returns {void}
       */
      doLog : function(logEvent) {
         Sm.log.util.Debug.abort( 
                  "You must implement this method in derived classes");
      },
      
      /**
       * Performs encoding of log entry properties that should be html encoded.
       * 
       * @private
       * 
       * @param {Sm.log.LoggingEvent} logEvent 
       * 
       * @returns {void}
       */
      htmlEncodeStringValues : function(logEvent) {
         var me = this, str;
         
         Ext.Object.each( logEvent, function( key, value ) {
            if( Ext.isString(value) ) {
               if( Ext.Array.indexOf( 
                        me.getHtmlEncodedLogEventProperties(), key) >= 0 )
               {
                  str = Ext.util.Format.htmlEncode(value);
                  logEvent[key] = str;
               }
               
            }
         });
      },
      
      /**
       * Outputs the log to its destination.
       * 
       * @private
       * @param {Sm.log.LoggingEvent} logEvent 
       * 
       * @returns {void}
       */
      log : function(logEvent) {
         if( !this.isStopped()) {
            this.getLayout().appendFormattedData(logEvent);
            if( this.getHtmlEncodedLogEventProperties().length > 0 ) {
               this.htmlEncodeStringValues(logEvent);
            }
            this.doLog(logEvent);
         }
      },

      /**
       * Returns the layout for this logger.
       * 
       * @returns {Sm.log.LayoutBase} 
       *          The layout for this logger.
       */
      getLayout : function() {
         if( !this.layout) {
            this.layout = Sm.log.TemplateLayout.getDefaultLayout(); 
         }
         return this.layout;
      },
      
      /**
       * Sets the layout for this logger.
       * 
       * @param {Sm.log.LayoutBase} layout The layout.
       * 
       * @returns {void}
       */
      setLayout : function(layout) {
         this.layout = layout;
      },
      
      /**
       * @protected 
       * 
       * Call this in the derived classes.
       * 
       * @param cfg
       */
      constructor : function(cfg) {
         this.initConfig(cfg);
         this.setInitialState();
      },
      
      /**
       * Initializes the appender state to whatever is appropriate fro this
       * appender.
       * 
       * @private
       * 
       * @returns {void}
       */
      setInitialState : function() {
         this.startLogging();         
      },

      /** 
       * Returns the appender state.
       * 
       * @returns {String} The appender state
       */
      getState : function () {
         return this.state;
      },
      
      /**
       * Returns true if the appender is stopped.
       * 
       * An stopped appender ignores all logs sent to it.
       * 
       * @returns {Boolean}
       */
      isStopped : function () {
         return this.state === Sm.log.AppenderBase.STOPPED;
      },
      
      /**
       * Stops the appender. 
       *
       * The appender will ignore all logs sent to it while stopped.
       * 
       * @returns {void}
       */
      stopLogging : function () {
         this.state = Sm.log.AppenderBase.STOPPED;         
      },
      
      /** 
       * Returns true if the appender is in the logging state.
       * 
       * In this state, all logs sent to the appender are logged.
       * 
       * @returns {Boolean}
       */
      isLogging : function() {
         return this.state === Sm.log.AppenderBase.LOGGING;
      },

      /**
       * Sets the appender in the loggins state.
       * 
       * All logs sent to the appender from now on will be logged.
       * 
       * @returns {void}
       */
      startLogging : function() {
         this.state = Sm.log.AppenderBase.LOGGING;
      },
      
      /**
       * Returns true if the appender support buffering.
       * 
       * While buffering, all logs sent to an appender are stored, but not
       * sent to the output destination until the appender passes to the 
       * logging state.
       * 
       * @returns {Boolean}
       */
      supportsBuffering : function() {
         return false;
      },
      
      /**
       * Returns a formatted string representing the log information.
       * 
       * This is used in most cases for appenders that log to line-oriented
       * devices, such as the browser console. 
       * 
       * @param {Sm.log.LoggingEvent} logEvent A copy of the data to log.
       * 
       * @returns {String} A text corresponding to the log data.
       */
      formatLogAsText : function(logEvent) {
         return this.getLayout().formatLogAsText(logEvent);
      }
   });
}());
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

/*global console: true */
(function() {
   "use strict"; //$NON-NLS-1$

   /**
    * An appender that uses native browser functions or Ext.log to send 
    * data to the browser console.
    * 
    * The root logger has this singleton attached, so that all logging
    * operations will go by default to the browser console, like this:
    * 
    * {@img log-browser-console.png alt text}
    */
   Ext.define('Sm.log.ExtLogAppender', { //$NON-NLS-1$
      extend: 'Sm.log.AppenderBase',
      
      singleton : true,
      
      uses : ['Sm.log.util.Assert',
              'Sm.log.Level'],
      
      /**
       * @protected
       * @inheritDoc
       */
      doLog : function(logEvent) {
         var extLevel = null, 
             textMessage,
             extMessage,
             loggedObject = logEvent.loggedObject,
             consoleArgs;
         
         textMessage =  this.formatLogAsText(logEvent);
         consoleArgs = [textMessage];
         if( loggedObject) {
            consoleArgs.push(loggedObject);
         }
         
         Sm.log.util.Assert.assert(logEvent);
         switch( logEvent.level) {
            case Sm.log.Level.NONE.getName():
            case Sm.log.Level.ALL.getName():
               Sm.log.util.Debug.abort( "We should never arrive here");
               break;
            case Sm.log.Level.FATAL.getName():
            case Sm.log.Level.ERROR.getName():
               if( window.console && console.error  && 
                        Ext.isFunction(console.error)) {
                  console.error.apply(console, consoleArgs);
                  return;
               }
               extLevel = "error";
               break;
            case Sm.log.Level.WARN.getName():
               if( window.console && console.warn  && 
                        Ext.isFunction(console.warn)) {
                  console.warn.apply(console, consoleArgs);
                  return;
               }
               extLevel = "warn";
               break;
            case Sm.log.Level.INFO.getName():
               if( window.console && console.info  && 
                        Ext.isFunction(console.info)) {
                  console.info.apply(console, consoleArgs);
                  return;
               }
               extLevel = "info";
               break;
            default:
               if( window.console && console.log && 
                        Ext.isFunction(console.log)) {
                  console.log.apply(console, consoleArgs);
                  return;
               }
               extLevel = "log";
               break;
         }
         extMessage = {msg : textMessage, level: extLevel};
         if( loggedObject ) {
            extMessage.dump = loggedObject;
         }
         Ext.log(extMessage);
      }
   });

}());
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

   /**
    * @abstract
    * 
    * Base class for all layouts.
    * 
    * A layout is in charge of formatting and augmenting the log data so that
    * it can be consumed by an appender. 
    * 
    * It knows about formatting the log time, obtaining an string that
    * represents all information in the log, adding special entries to a 
    * logging event, nicely formatting a logged object, etc.
    * 
    */
   Ext.define('Sm.log.LayoutBase', { //$NON-NLS-1$
      uses : ['Ext.Date',
              'Ext.JSON',
              'Sm.log.util.Debug', 
              'Sm.log.util.Assert'],
      
      config : {
         /** 
          * @cfg
          * @accessor
          * 
          * The format string used to format log time.
          * 
          * See Ext.Date.format for information about this format string. 
          */
         timeFormat : "Y-m-d H:i:s.u",
   
         /**
          * @cfg
          * @accessor
          * 
          * If set to true, an attempt will be made to highlight the logged
          * object JSON-formatted. 
          * 
          * It might be ignored if the JSON formatter does not support 
          * highlighting.
          * 
          */
         highlightLoggedObject : true,
         
         /**
          * @cfg
          * @accessor
          * 
          * If set to true, an attempt will be made to format the logged
          * object as a multiple line string.
          * 
          * It might be ignored if the JSON formatter does not support 
          * multiple line formatting.
          */
         multilineLoggedObject : false,
         
         /**
          * @cfg
          * @accessor
          * 
          * If set to true, the logged object will be output.
          */
         exportFormattedLoggedObject : true,
         
         /**
          * @cfg
          * @accessor
          * 
          * Desired indentation used to format the logged object.
          * 
          * It might be ignored if the JSON formatter does not support 
          * indenting.
          */
         formatIndentLoggedObject : 3
      },

      /**
       * Appends extra formatted data to the original log event.
       * 
       * By default, it provides formattedTime and formattedMessage
       * values, as well as a formattedLogObject if the appender is
       * configured to log the loggedObject too. 
       * 
       * Derived classes might want to add data for the output destination
       * to handle. For example, an output window might want to provide
       * a version of a formatted logged object that will be shown in a 
       * single line, and another one formatted in multiple line, 
       * to be shown in an expanded view.
       *
       * @protected
       * 
       * @param {Sm.log.LoggingEvent} logEvent The original log data.
       * 
       * @returns {void}
       */
      appendFormattedData : function(logEvent) {
         var formattedLoggedObject;
         logEvent.formattedTime = this.formatTime(logEvent);
         logEvent.formattedMessage = this.formatMessage(logEvent);
         if( this.getExportFormattedLoggedObject() ) {            
            if( logEvent.hasLoggedObject) {
               logEvent.formattedLoggedObject = 
                  this.formatLoggedObject(logEvent);
             }
            else {
               logEvent.formattedLoggedObject = '';
            }
         }
      },
      
      /**
       * Returns a text corresponding to the log.
       * 
       * This is useful in scenarios in which the log is written in a
       * single line, such as the browser console.
       * 
       * @protected
       * @abstract
       * @param {Sm.log.LoggingEvent} logEvent The log information.
       */
      formatLogAsText : function(logEvent) {
         Sm.log.util.Debug.abort( "You must use an appender that knows " +
                         "how to format a log event as a text" );
      },
   
      /**
       * Formats the log time.
       * 
       * If there is no timeFormat, calls toString.
       * 
       * @param {Sm.log.LoggingEvent} logEvent The log data.
       * 
       * @protected
       * @returns
       */
      formatTime : function(logEvent) {
         var time = logEvent.time;
         if( this.getTimeFormat() ) {
            return Ext.Date.format( time, this.getTimeFormat() );
         }
         return time.toString();
      },
      
      /**
       * Formats the log message.
       * 
       * This will use the extra formatting information provided in the log
       * method call to return a formatted message. Take a look at this [wiki
       * entry](http://code.google.com/p/log4js-ext/wiki/LoggingFormatting) 
       * for examples on supported formatting.
       * 
       * @param {Sm.log.LoggingEvent} logEvent The log data.
       * 
       * @protected
       * @returns
       */
      formatMessage : function(logEvent) {
         var message = logEvent.message,
             formatParams = logEvent.formatParams,
             useComplexLayout,
             args, template, i;
         
         if( formatParams ) {
            Sm.log.util.Assert.assert(formatParams.length > 0);
            
            useComplexLayout = Ext.isObject(formatParams[0]);
            if( !useComplexLayout ) {
               message = this.simpleFormat( message, formatParams );
            }
            else {
               message = this.multiFormat( message, formatParams );
            }
         }
         else {
            message = message.toString();
         }
         
         return message;
       },
       
       /**
        * Returns a formatted text corresponding to the logged object.
        * 
        * @param {Sm.log.LoggingEvent} logEvent The log data.
        * @returns The formatted text corresponding to the logged object.
        * 
        * @protected
        */
       formatLoggedObject : function(logEvent) {         
          if(logEvent.hasOwnProperty( "loggedObject" )) {
             return this.jsonLikeFormat(logEvent.loggedObject, 
                      this.getHighlightLoggedObject(), 
                      this.getMultilineLoggedObject() );
          }
          return '';
       },
       
       /**
        * CSS styles used to highight logged object as JSON.
        * 
        * @private
        */
       jsonCls : {
         key : 'sm-log-json-key',
         string : 'sm-log-json-string',
         number : 'sm-log-json-number',
         bool : 'sm-log-json-boolean',
         nul : 'sm-log-json-null'
       },
      
       /**
        * Highlights and makes more readable a JSON string corresponding 
        * to a logged object. 
        * 
        * @param {String} json 
        *        The json string corresponding to the logged object.
        * @param jsonCls CSS classes used for highlighting. 
        * 
        * @returns {String} A string representing the highlighted logged object.
        * 
        * @protected
        */
        // Obtained from http://jsfiddle.net/KJQ9K/ : many thanks!!
        jsonSyntaxHighlight : function(json, jsonCls) {
          var regex;
          // Special case, we *want* undefined
          if( json === undefined ) {
            return '<span class="' + this.jsonCls.nul + '">undefined</span>';
          }
         
          regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
          return json.replace(regex, function (match) {
             var cls = jsonCls.number, isKey = false, isString = false, result;
             if (/^"/.test(match)) {
                 if (/:$/.test(match)) {
                     cls = jsonCls.key;
                     isKey = true;
                 } else {
                     cls = jsonCls.string;
                     isString = true;
                 }
             } else if (/true|false/.test(match)) {
                 cls = jsonCls.bool;
             } else if (/null/.test(match)) {
                 cls = jsonCls.nul;
             }
             
             // *******************************************************
             // Improve readability
             // Remove quotes from keys and add additional space
             if( isKey ) {
                // We *MUST* leave ':' here, because if it is out
                // of span, searches for something like 'key:' will not 
                // find the key because there will be a 'hidden' span tag there.
                // And this kind of search shuld be rather common!
                match = match.slice(1, match.length - 2 ) + ": ";
             }
             // Replace quotes by single quotes from strings
             if( isString ) {
                match = "'" + match.slice(1, match.length -1 ) + "'";
             }
             result = '<span class="' + cls + '">' + match + '</span>';
             return result;
         });
      },    
      
      /**
       * Returns a JSON string correponding to an object.
       * 
       * @param obj The object to format.
       * @param {Boolean} highlight If true, attempts to provide 
       *                  highlighting (html) 
       * @param {Boolean} multiline Use multiple text lines?
       * @param {Number} indent Indentation level (spaces)
       * 
       * @returns {String} A formatted JSON string representing an object.
       * 
       * @protected
       */
      jsonLikeFormat : function( obj, highlight, multiline, indent ) {
         var json;
         // Crazy as it might seem, just writing 'if(JSON)' generates
         // an error in IE 9. That's why we wrap call in try..catch, to
         // handle IE 9 failure :(
         try {
            // This one allows for better readability thanks to spacing
            json = JSON.stringify( obj, undefined, 
                               indent || this.getFormatIndentLoggedObject() );
         }
         catch(ex) {
            json = Ext.JSON.encode(obj);
         }
         if( highlight ) {
            if( json !== undefined ) {
               // Replace spaces *before* adding html tags,
               // or the white space in the tags will get replaced too,
               // with bad effects            
               json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').
                        replace(/>/g, '&gt;');
               if( multiline ) {
                  json = json.replace( / /g, '&nbsp;');
                  json = json.replace( /(\r\n|\n|\r)/gm, '<br>');
               }
            }
            json = this.jsonSyntaxHighlight(json, this.jsonCls);
         }
         else {
            // Special case, we *want* undefined
            if( json === undefined) {
               return "undefined";
            }
         }
         return json;
      },
      
      /**
       * Formats a string depending on the format parameters a-la
       * Ext.Template.
       * 
       * It is a poor man's version of Ext.Template.apply(..) that is not very
       * efficient *but* can cope with values not being present without
       * returning an empty string, unlike Ext.Template
       * 
       * @protected
       * 
       * @param {String} str The string to format.
       * @param {Array} formatParams Formatting parameters
       * @returns {String} The formatted string.
       */
      multiFormat : function( str, formatParams ) {
         var i, result = str, formatKeyValue;

         // Inlined function to avoid warnings with my IDE: else, I would
         // have defined it inline in the 'each' iteration below
         formatKeyValue = function( key, value ) {
            result = result.replace( "{" + key + "}", value.toString() );
         };

         for( i = 0; i < formatParams.length; i = i + 1) {
            Ext.Object.each(formatParams[i], formatKeyValue );
         }
         return result;
      },

      /**
       * Format a string using the format parameters, a-la Ext.String.format.
       * 
       * @protected
       * 
       * @param {String} str The string to format.
       * @param {Array} formatParams Formatting parameters
       * 
       * @returns {String} The formatted String
       */
      simpleFormat : function( str, formatParams ) {
         var i, result = str, formatKeyValue;

         for( i = 0; i < formatParams.length; i = i + 1) {
            result = result.replace( "{" + i + "}", formatParams[i]);
         }
         return result;         
      },
      
      /**
       * Call this method from derived classes.
       *  
       * @protected
       * 
       * @param cfg
       */
      constructor : function(cfg) {
         this.initConfig(cfg);
      }
   });
}());
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

(function() {
   "use strict"; //$NON-NLS-1$

   /**
    * The level is the importance or priority of a certain logging operation.
    * 
    * Predefined levels are FATAL, ERROR, WARN, INFO, DEBUG, and TRACE.
    * 
    * NONE and ALL are useful to control logging, but they can't be used
    * in a logging operation, as they make no sense in that context. 
    */
   Ext.define('Sm.log.Level', { //$NON-NLS-1$

      uses: ['Sm.log.util.Debug',
             'Sm.log.util.Assert'],

      statics : {
         /**
          * Initializes logging levels.
          * 
          * @private
          * 
          * @returns {void}
          * 
          */
         initStatics : function() {
            this.NONE = Ext.create( 'Sm.log.Level', 
                     {name:'NONE', level: Math.pow(2,31)-1} );
            this.FATAL = Ext.create( 'Sm.log.Level', 
                     {name:'FATAL', level:600});
            this.ERROR = Ext.create( 'Sm.log.Level', 
                     {name:'ERROR', level:500});
            this.WARN =  Ext.create( 'Sm.log.Level', 
                     {name:'WARN', level:400});
            this.INFO =  Ext.create( 'Sm.log.Level', 
                     {name:'INFO', level:300});
            this.DEBUG = Ext.create( 'Sm.log.Level',
                     {name:'DEBUG', level:200});
            this.TRACE = Ext.create( 'Sm.log.Level', 
                     {name:'TRACE', level:100});
            this.ALL = Ext.create( 'Sm.log.Level', 
                     {name:'ALL', level:0});
         },
         
         /**
          * Returns a level, given its name.
          * 
          * This can be very useful to get a level given a user-specified
          * text via a combo, etc.
          * 
          * @param {String} levelName The level name.
          * 
          * @returns {Sm.log.Level} The level with the specified name.
          */
         getLevel : function( levelName ) {
            switch(levelName.toUpperCase()) {
               case this.ALL.getName() : return this.ALL;
               case this.NONE.getName() : return this.NONE;
               case this.FATAL.getName() : return this.FATAL;
               case this.ERROR.getName() : return this.ERROR;
               case this.WARN.getName() : return this.WARN;
               case this.INFO.getName() : return this.INFO;
               case this.DEBUG.getName() : return this.DEBUG;
               case this.TRACE.getName() : return this.TRACE;
               default:
                  return null;
            }
         },
         
         /**
          * Returns a level's level, given the level name.
          * 
          * @param {String} levelName The level name.
          * 
          * @returns {Number} 
          */
         getLevelLevel :function( levelName ) {
            switch(levelName.toUpperCase()) {
               case this.ALL.getName() : return this.ALL.getLevel();
               case this.NONE.getName() : return this.NONE.getLevel();
               case this.FATAL.getName() : return this.FATAL.getLevel();
               case this.ERROR.getName() : return this.ERROR.getLevel();
               case this.WARN.getName() : return this.WARN.getLevel();
               case this.INFO.getName() : return this.INFO.getLevel();
               case this.DEBUG.getName() : return this.DEBUG.getLevel();
               case this.TRACE.getName() : return this.TRACE.getLevel();
               default:
                  Sm.log.util.Debug.abort( "This code should never execute");
                  return;
            }
         },

         /**
          * Represents 'no level', useful in some contexts to
          * specify that no level should be logged.
          * 
          * Do not use as a log operation level.
          * 
          * @property {Sm.log.Level}
          * @readonly
          */
         NONE  : undefined, 

         /**
          * Represents a fatal error.
          * 
          * The diference between error and fatal error depends on the
          * context, and might or might not exist in some contexts. How to
          * interpret that depends on the context, and has to be defined
          * by the application
          * 
          * @property {Sm.log.Level}
          * @readonly
          */
         FATAL : undefined,

         /**
          * Represents an error.
          * 
          * The diference between error and fatal error depends on the
          * context, and might or might not exist in some contexts. How to
          * interpret that depends on the context, and has to be defined
          * by the application
          * 
          * @property {Sm.log.Level}
          * @readonly
          */
         ERROR : undefined,

         /**
          * Represents a warning.
          * 
          * @property {Sm.log.Level}
          * @readonly
          */
         WARN :  undefined,

         /**
          * Represents an informative log.
          * 
          * @property {Sm.log.Level}
          * @readonly
          */
         INFO :  undefined,
         
         /**
          * Represents a debug log.
          * 
          * We will probably be interested in debug logs only while debugging.
          * 
          * @property {Sm.log.Level}
          * @readonly
          */
         DEBUG : undefined,

         /**
          * Represents a low level debug log.
          * 
          * We will probably be interested in trace logs only while heavily
          * debugging.
          * 
          * @property {Sm.log.Level}
          * @readonly
          */
         TRACE : undefined,
         
         /**
          * Represents 'all level', useful in some contexts to
          * specify that alls levels should be logged.
          * 
          * Do not use as a log operation level.
          * 
          * @property {Sm.log.Level}
          * @readonly
          */
         ALL   : undefined
      },
      
      config : {
         /**
          * @accessor
          * @cfg [=value provided in constructor] (required)
          * 
          * The level name.
          * 
          * @readonly
          */
         name : '',
         
         /**
          * @accessor
          * @cfg [=value provided in constructor] (required)
          * 
          * The level value.
          * 
          * @readonly
          */
         level : 0
      },
      
      /**
       * Creates a new level.
       * 
       * You should not create your own levels. The library has not been created
       * with the idea of allowing user defined levels. Therefore, it might or
       * might not work if you do so.
       * 
       * @private
       * 
       * @param cfg
       */
      constructor : function (cfg) {
         // Avoid this check because Assert might not be loaded, as
         // this is called indirectly by initStatics, which is called
         // at the end of this file
         /*
         Sm.log.util.Assert.assert(cfg.name);
         Sm.log.util.Assert.assert(cfg.level);
         */

         this.initConfig(cfg);
      },
      
      /**
       * Compares two levels, return true if this ones is lesser or equal
       * than the one received by the function.
       * 
       * @param {Sm.log.Level} level The level to compare with this level.
       * @returns {Boolean}
       */
      le : function( level ) {
         return this.getLevel() <= level.getLevel();
      }
   },
   // Initialize statics: this function receives the class as 'this'
   function () { this.initStatics(); } );
   
}());
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

   /** 
    * An appender that knows how to output data to the built-in log viewer
    * window (see {@link Sm.log.LogViewerWindow}).
    */
   Ext.define('Sm.log.LogViewerAppender', { //$NON-NLS-1$
      extend : 'Sm.log.AppenderBase',
      
      uses : ['Sm.log.util.Assert'],
      
      /**
       * @private
       * 
       * Attaches the appender to a viewer.
       * 
       * @param {Sm.log.LogViewerWindow} viewer 
       *     The viewer to which to attach this appender.
       * 
       * @returns {void}
       */
      attachViewer : function( viewer ) {
         Sm.log.util.Assert.assert(viewer);
         Sm.log.util.Assert.assert( !this.viewer );
         this.viewer = viewer;
      },
      
      /**
       * @private
       * 
       * Detaches the appender from this viewer.
       * 
       * @returns {void}
       */
      detachViewer : function() {
         Sm.log.util.Assert.assert( this.viewer);
         if( this.isLogging() ) {
            this.startBuffering();
         }
         this.viewer = null;         
      },
      
      /**
       * Starts buffering logs.
       * 
       * While buffering, logs are not sent to the viewer window automatically,
       * but rather they are kept apart until we change the status to logging.
       * Then, all buffered logs will be sent to the window.
       * 
       * This is useful in cases where the viewer window should not be updated
       * to avoid interference while debugging, or where the window simply does
       * not exist but we want to register such log nevertheless.
       * 
       * @returns {void}
       */
      startBuffering : function() {
         this.state = Sm.log.AppenderBase.BUFFERING;
      },
      
      /**
       * Returns true if the viewer is buffering logs.
       * 
       * @returns {Boolean} true if the viewer is buffering logs.
       */
      isBuffering : function () {
         return this.state === Sm.log.AppenderBase.BUFFERING;
      },
      
      /**
       * Clears the buffered logs.
       * 
       * The buffered log are lost.
       * 
       * @returns {void}
       */
      clearBuffer : function() {
         this.buffer = [];
      },
      
      /**
       * Returns true if we can log.
       * 
       * Note that we might not be able to log directly when the viewer
       * window is not available, for example.
       * 
       * @returns {Boolean}
       */
      canLog : function() {
         return this.viewer;
      },

      /**
       * Sets the appender in the loggins state.
       * 
       * All logs sent to the appender from now on will be logged.
       * Besides, if there were some buffered logs, they will be immediately
       * sent to the log viewer window, if any.
       * 
       * @returns {void}
       */
      startLogging : function() {
         // If not attached, we can't start logging
         Sm.log.util.Assert.assert( this.canLog() );
         
         if( this.buffer.length > 0 ) {
            this.doPhysicalLog( this.buffer);
            this.clearBuffer();
         }
         this.callParent(arguments);
      },
      
      /**
       * @inheritDoc
       */
      stopLogging : function () {
         this.callParent(arguments);

         this.clearBuffer();
      },
      
      /** 
       * Returns true, as this appender supports log buffering.
       * 
       * @returns {Boolean} true, as this appender supports log buffering.
       */
      supportsBuffering : function() {
         return true;
      },
      
      /**
       * @protected
       * @inheritDoc
       */
      setInitialState : function () {
         this.startBuffering();
      },
      
      /**
       * Creates a new log viewer appender.
       * 
       * @param cfg
       */
      constructor : function (cfg ) {
         this.callParent(arguments);
         
         // We are going to output to HTML, in the end
         this.setHtmlEncodedLogEventProperties( 
            [// "time" // Never encode this, it is a Date
             // ,"formattedTime" // If some layout adds HTML, we want HTML 
             "message"
             ,"ndc"
             // ,"hasLoggedObject" // Never encode this, it is a boolean
             ,"formattedMessage" 
             // ,"formattedLoggedObject" // We *are* adding HTML, want it used
             ] );
         this.clearBuffer();
      },

      /**
       * @inheritDoc
       * 
       * @protected
       * 
       * @param logEvent
       */
      doLog : function(logEvent) {
         var indent = 5;
         
         // @todo: pag Dislike doing this here, maybe should create a custom
         // layout that adds the formattedMultilineLoggedObject?
         // But that is cumbersome
         logEvent.formattedMultilineLoggedObject = '';
         if( logEvent.hasLoggedObject) {
           logEvent.formattedMultilineLoggedObject = 
              this.getLayout().jsonLikeFormat( 
                       logEvent.loggedObject, true, true, indent );
         }
         logEvent.formattedMultilineMessage = 
            logEvent.formattedMessage.replace( /(\r\n|\n|\r)/gm, '<br>');
         


         if( this.isBuffering()) {
            this.buffer.push(logEvent);
         }
         else {
            this.doPhysicalLog([logEvent]);
         }
      },

      /**
       * @private
       * 
       * Performs outputs of an array of log events.
       * 
       * Using an array can help with performance, as it allows to
       * send a handful of buffered logs in a single step.
       * 
       * @param {Array} logEvents
       * 
       * @returns {void}
       */
      doPhysicalLog : function(logEvents) {
         Sm.log.util.Assert.assert( this.viewer);
         this.viewer.appendLoggingEvents(logEvents);
      }
      
   });
}());
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

(function() {
   "use strict"; //$NON-NLS-1$

   /** 
    * A logger performs logging using the error, info, debug and other 
    * functions.
    * 
    * Logged data is handled by the logger appenders 
    * (see {@link Sm.log.AppenderBase}), 
    * or its parent's appenders,
    * that send it somewhere: the console, a window, etc.
    * 
    * An appender will need to format data, and it will use its
    * layout (see {@link Sm.log.LayoutBase}) for that purpose. 
    */
   Ext.define('Sm.log.Logger', { //$NON-NLS-1$
      
      uses : ['Ext.Array',
              'Sm.log.Level',
              'Sm.log.LoggingEvent',
              'Sm.log.ExtLogAppender',
              'Sm.log.util.Assert'],
              
      config : {
         /**
          * @cfg {String} [=assigned in constructor] (required)
          * @accessor
          * 
          * The logger's category.
          * 
          * This can be considered the logger name, too.
          * 
          * @readonly
          */
         category : '',
         
         // Method automatically generated for config.category
         /**
          * @method setCategory
          * @private
          */
         
         /**
          * @cfg {Sm.log.Level} 
          * @accessor
          * 
          * The level for this logger, or null.
          * 
          * Logs with a level lesser than this level will be ignored.
          * See {@link #getEffectiveLevel} for additional information.
          */
         level : null,
         
         /**
          * @cfg
          * @accessor
          * 
          * If set to false, disables all logging.
          */
         enabled : true,
         
         /**
          * @cfg {Array}
          * @accessor
          * 
          * The appenders to which this logger outputs directly.
          * 
          * See {@link #getEffectiveAppenders} for additional information.
          * 
          */
         appenders : [],
                  
         // Method automatically generated for config.appender
         /**
          * @method setAppenders
          * @private
          */
                 
         /**
          * @cfg
          * @accessor
          * 
          * If true, this logger will log to its appenders plus its parent
          * appenders.
          */
         additivity : true
      },
                   
      statics : {
         /**
          * If false, no logger will output to its appenders, independently
          * of the logger enabled state.
          * 
          * @static
          * @property
          */
         enabled : true,
         
         /**
          * Returns the root logger, the logger that is the parent of all
          * other loggers in the application.
          * 
          * By default, the root logger uses the {@link Sm.log.ExtLogAppender}
          * to output logs.
          * 
          * @returns {Sm.log.Logger} The root logger.
          * 
          * @static
          */
         getRoot : function() {
            if( this.PRIVATE_root === undefined ) {
               this.PRIVATE_root = 
                  Ext.create('Sm.log.Logger', 
                      {category:'', level: Sm.log.Level.TRACE});
               this.PRIVATE_root.addAppender(Sm.log.ExtLogAppender);
            }
            return this.PRIVATE_root;
         },

/*         
         loggerExists : function( category ) {
            var parts, logger, found;
            
            if( category === '') {
               return true;
            }
            
            parts = category.split(".");
            logger = this.getRoot();
            found = true;
            Ext.Array.forEach( parts, function(part) {
               Sm.log.util.Assert.assert( part );
               if( !logger[part] ) {
                  found = false;
                  return false;
               }
               logger = logger[part];
            });
        
            return found;
         },
*/
         /**
          * @static
          * 
          * Returns a logger for the specified category.
          * 
          * If there is no such logger, it is created. You should never
          * instantiate loggers with the logger constructor, but rather you
          * should use this function for that purpose.
          * 
          * @param {String} category The category for which to get the logger.
          * 
          * @returns {Sm.log.Logger}
          * 
          */
         getLogger : function( category ) {
            Sm.log.util.Assert.assert( category !== undefined );
            
            if( !Ext.isString(category) ) {
               if( category.$isClass ) {
                  category = category.getName();
               }
               else if( category.self ) {
                  category = category.self.geName();
               }
               else {
                  category = category.toString();
               }
            }
            
            if( category === '') {
               return this.getRoot();
            }
            
            // We take the 'easy' route: we create all the hierachy
            // of logger: for 'a.b.c' we create a, a.b and a.b.c logger
            // We could optimize this, but we'll wait until/if it is needed
            var parts = category.split("."), cat = "",
                logger = this.getRoot(),
                loggerProperty;
            Ext.Array.forEach( parts, function(part) {
               Sm.log.util.Assert.assert( part );
               cat = cat + part;
               loggerProperty = part + "$SmLgr";
               if( !logger[loggerProperty] ) {
                 logger[loggerProperty] = new Sm.log.Logger( {category:cat});
                 logger[loggerProperty].parentLogger = logger;
               }
               logger = logger[loggerProperty];
               Sm.log.util.Assert.assert( !Ext.isFunction(logger));
               cat = cat + ".";
            });
            
            return logger;
         }
         
      },
      
      /**
       * Returns the effective enabled state, taking into account
       * both this logger enabled property and the static enabled property. 
       * 
       * @returns {Boolean}
       */
      getEffectiveEnabled : function() {
         return this.getEnabled() && this.self.enabled;
      },
      
      /** 
       * Returns all appenders to which this logger should log.
       * 
       *  This includes its own appenders, and, if additivity is true,
       *  its parent logger appenders -which in turn might contribute
       *  its own parent appenders if its additivity is set to true.
       * 
       * @returns {Array}
       */
      getEffectiveAppenders : function() {
         var result = [], appenders = this.getAppenders();
         
         if( appenders && appenders.length > 0 ) {
            result = result.concat( appenders);
         }
         if( this.parentLogger && this.getAdditivity() ) {
            result = result.concat( this.parentLogger.getEffectiveAppenders());
         }
         return result;
      },
      
      /**
       * Adds a new appender to this logger.
       * 
       * @param {Sm.log.AppenderBase} appender 
       *        The appender to add to this logger.
       * 
       * @returns {void}
       */
      addAppender : function(appender) {
         this.getAppenders().push(appender); 
      },
      
      /**
       * Removes an appender from this logger.
       * 
       * @param {Sm.log.AppenderBase} appender The appender to remove.
       * 
       * @returns {void}
       */
      removeAppender : function(appender) {
         Ext.Array.remove( this.getAppenders(), appender );
      },
      
      /** 
       * Removes all appenders from this logger
       * 
       * @returns {void}
       */
      removeAllAppenders : function() {
         this.setAppenders( [] );
      },

      /** 
       * Returns the effective level for this logger.
       * 
       * If a level has been set by calling {@link #setLevel}, then that will
       * be the effective level. Else, the parent effective level will be used.
       * 
       * @returns {Sm.log.Level} The effective level.
       */
      getEffectiveLevel : function() {
        if( !this.getLevel() ) {
           return this.parentLogger.getEffectiveLevel();
        } 
        return this.getLevel();
      },
      
      /**
       * Logs data with the specified level.
       * 
       * Arguments for this function are variable, and it is possible to 
       * log a simple message, perform advanced formatting or even log objects.
       * Check this 
       * [link](http://http://code.google.com/p/log4js-ext/wiki/LoggingFormatting)
       * for examples on how to use this function. 
       * 
       * @param level The log level. 
       * @param messageArgs The arguments for the logging operation.
       * 
       * @returns {void}
       */
      log : function(level, messageArgs) {
         var args = [], i;
         for( i = 1; i < arguments.length; i = i + 1 ) {
            args.push(arguments[i]);
         }
         this.doLog(level, args);
      },

      /**
       * Logs data with a FATAL level.
       * 
       * Arguments for this function are variable, and it is possible to 
       * log a simple message, perform advanced formatting or even log objects.
       * Check this 
       * [link](http://http://code.google.com/p/log4js-ext/wiki/LoggingFormatting)
       * for examples on how to use this function. 
       * 
       * @param messageArgs The arguments for the logging operation.
       * 
       * @returns {void}
       */
      fatal : function(messageArgs) {
         this.doLog(Sm.log.Level.FATAL, arguments);         
      },
      
      /**
       * Logs data with an ERROR level.
       * 
       * Arguments for this function are variable, and it is possible to 
       * log a simple message, perform advanced formatting or even log objects.
       * Check this 
       * [link](http://http://code.google.com/p/log4js-ext/wiki/LoggingFormatting)
       * for examples on how to use this function. 
       * 
       * @param messageArgs The arguments for the logging operation.
       * 
       * @returns {void}
       */
      error : function(messageArgs) {
         this.doLog(Sm.log.Level.ERROR, arguments);         
      },
      
      /**
       * Logs data with a WARN level.
       * 
       * Arguments for this function are variable, and it is possible to 
       * log a simple message, perform advanced formatting or even log objects.
       * Check this 
       * [link](http://http://code.google.com/p/log4js-ext/wiki/LoggingFormatting)
       * for examples on how to use this function. 
       * 
       * @param messageArgs The arguments for the logging operation.
       * 
       * @returns {void}
       */
      warn : function(messageArgs) {
         this.doLog(Sm.log.Level.WARN, arguments);         
      },
      
      /**
       * Logs data with an INFO level.
       * 
       * Arguments for this function are variable, and it is possible to 
       * log a simple message, perform advanced formatting or even log objects.
       * Check this 
       * [link](http://http://code.google.com/p/log4js-ext/wiki/LoggingFormatting)
       * for examples on how to use this function. 
       * 
       * @param messageArgs The arguments for the logging operation.
       * 
       * @returns {void}
       */
      info : function() {
         this.doLog(Sm.log.Level.INFO, arguments);         
      },
      
      /**
       * Logs data with a DEBUG level.
       * 
       * Arguments for this function are variable, and it is possible to 
       * log a simple message, perform advanced formatting or even log objects.
       * Check this 
       * [link](http://http://code.google.com/p/log4js-ext/wiki/LoggingFormatting)
       * for examples on how to use this function. 
       * 
       * @param messageArgs The arguments for the logging operation.
       * 
       * @returns {void}
       */
      debug : function(messageArgs) {
         this.doLog(Sm.log.Level.DEBUG, arguments);         
      },
      
      /**
       * Logs data with a TRACE level.
       * 
       * Arguments for this function are variable, and it is possible to 
       * log a simple message, perform advanced formatting or even log objects.
       * Check this 
       * [link](http://http://code.google.com/p/log4js-ext/wiki/LoggingFormatting)
       * for examples on how to use this function. 
       * 
       * @param messageArgs The arguments for the logging operation.
       * 
       * @returns {void}
       */
      trace : function(messageArgs) {
         this.doLog(Sm.log.Level.TRACE, arguments);         
      },
      
      /**
       * Returns true if this logger will perform logs with the specified level.
       *  
       * @param {Sm.log.Level} level The log level.
       * @returns {Boolean} 
       *     true if this logger will perform logs with the specified level.
       */
      isLevelEnabled : function(level) {
         return this.getEffectiveLevel().le(level);
      },
      
      /**
       * Returns true if this logger will perform logs with the FATAL level.
       *  
       * @returns {Boolean} 
       *     true if this logger will perform logs with the FATAL level.
       */
      isFatalEnabled: function() {
         return this.isLevelEnabled( Sm.log.Level.FATAL);
      },
      
      /**
       * Returns true if this logger will perform logs with the ERROR level.
       *  
       * @returns {Boolean} 
       *     true if this logger will perform logs with the ERROR level.
       */
      isErrorEnabled: function() {
         return this.isLevelEnabled( Sm.log.Level.ERROR);
      },
      
      /**
       * Returns true if this logger will perform logs with the WARN level.
       *  
       * @returns {Boolean} 
       *     true if this logger will perform logs with the WARN level.
       */
      isWarnEnabled: function() {
         return this.isLevelEnabled( Sm.log.Level.WARN);
      },
      
      /**
       * Returns true if this logger will perform logs with the INFO level.
       *  
       * @returns {Boolean} 
       *     true if this logger will perform logs with the INFO level.
       */
      isInfoEnabled: function() {
         return this.isLevelEnabled( Sm.log.Level.INFO);
      },
      
      /**
       * Returns true if this logger will perform logs with the DEBUG level.
       *  
       * @returns {Boolean} 
       *     true if this logger will perform logs with the DEBUG level.
       */
      isDebugEnabled: function() {
         return this.isLevelEnabled( Sm.log.Level.DEBUG);
      },
      
      /**
       * Returns true if this logger will perform logs with the TRACE level.
       *  
       * @returns {Boolean} 
       *     true if this logger will perform logs with the TRACE level.
       */
      isTraceEnabled: function() {
         return this.isLevelEnabled( Sm.log.Level.TRACE);
      },
      
      /**
       * @private
       * 
       * Performs the real log.
       * 
       * @param {Sm.log.Level} level The log level.
       * @param args The log arguments.
       * 
       * @returns {void}
       */
      doLog : function(level, args) {
         var logEvent, time, cfg, i;
         Sm.log.util.Assert.assert( level );
         Sm.log.util.Assert.assert( args );
         Sm.log.util.Assert.assert( args.length >= 1 );
         
         if( !this.getEffectiveEnabled() ) {
            return;
         }
         
         if( this.isLevelEnabled(level)) {
            cfg = {};
            cfg.level = level;
            cfg.message = args[0];
            cfg.time = new Date();
            cfg.category = this.getCategory();
            if( args.length > 1 ) {
               cfg.formatParams = [];
               for( i = 1; i < args.length; i = i + 1 ) {
                  cfg.formatParams.push( args[i] );
               }
            }
            Ext.Array.forEach( this.getEffectiveAppenders(), 
                     function(appender) 
            {
               // We create a copy for every appender to avoid appenders
               // tinkering with events and affecting other appenders
               logEvent = Ext.create( 'Sm.log.LoggingEvent', cfg ); 
               appender.log( logEvent );
            });
         }
      },
      
      /**
       *  @private
       * 
       *  Do not use this: use {@link Sm.log.Logger#getLogger} instead.
       * 
       */
      constructor : function (cfg) {
         Sm.log.util.Assert.assert(cfg);
         Sm.log.util.Assert.assert(cfg.category === '' || cfg.category );
         this.initConfig(cfg);

         this.setAppenders( [] );
      }
   });
   
}());
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

(function() {
   "use strict"; //$NON-NLS-1$
   
   /**
    * Contains the information provided in a log operation.
    * 
    * Appenders will receive a copy of a logging event so that they can
    * augment it without affecting other appenders.
    * 
    * For example, an appender for the built-in log viewer might want to add a 
    * JSON multiline formatted version of the logged object.
    */
   Ext.define('Sm.log.LoggingEvent', { //$NON-NLS-1$
      uses: ['Sm.log.util.Assert', 
             'Sm.log.NDC'],
      
      /**
       * @property [=assigned in the constructor]
       * 
       * @readonly
       * 
       * The category of the logger that created this log entry.
       */
      category: '',
      
      /**
       * @property {Date} [=assigned in the constructor]
       * 
       * @readonly
       * 
       * The date and time this log entry was created.
       */
      time: null,
      
      /**
       * @property {Sm.log.Level} [=assigned in the constructor]
       * 
       * @property [=assigned in the constructor]
       * 
       * @readonly
       * 
       * The level of the log operation that created this log entry.
       */
      level : null,
      
      /**
       * @property [=assigned in the constructor]
       * 
       * @readonly
       * 
       * The original message parameter for this log entry.
       * 
       * Might contain formatting parameters. See {@link #formattedMessage}
       * for additional information.
       */
      message : '',
      
      /**
       * @property {String} [=assigned in the constructor]
       * 
       * @readonly
       * 
       * The NDC at the moment this log entry was created.
       */
      ndc : undefined,
      
      /**
       * @property [=assigned in the constructor]
       * 
       * @readonly
       * 
       * The logged object passed when this log entry was created -if any.
       */
      loggedObject : undefined,
      
      /**
       * @property {Array} [=assigned in the constructor]
       * 
       * @readonly
       * The formatting parameters passed when this log entry was created.
       */
      formatParams : undefined,
      
      /**
       * @property [=assigned in the constructor]
       * 
       * @readonly
       * 
       * True if this entry includes a looged object.
       */
      hasLoggedObject : false,
      
      /**
       * @property {Number} [=assigned in the constructor]
       * 
       * @readonly
       * 
       * The level for the level object passed when this log entry was created.
       * 
       * Makes several checks easier and faster.
       */
      levelLevel : undefined,
      
      /**
       * @property {String}
       * 
       * The formatted message, obtained from the message and the formatParams.
       * 
       * The appender's layout will provide this one, and can modify it
       * to suit the output destination needs.
       */
      formattedMessage : undefined,
      
      /**
       * @property {String}
       * 
       * The formatted time.
       * 
       * The appender's layout will provide this one, and can modify it
       * to suit the output destination needs.
       */
      formattedTime : undefined,

      /**
       * @property {String}
       * 
       * A string representing the loggedObject.
       * 
       * The appender's layout will provide this one, and can modify it
       * to suit the output destination needs.
       */
      formattedLoggedObject : undefined,

      /**
       * @private
       * 
       * Handles the message parameter to extract the loggedObject, if any,
       * etc.
       */
      handleMessage : function() {
         // If message is object or array, we need to handle
         // the 'loggedObject' case
         if( Ext.isObject(this.message) || Ext.isArray(this.message)) {
            // If this is a message object (has 'loggedObject'), then
            // we try to get a message from it via its 'message' or
            // 'msg' properties or its toString method
            if( this.message.hasOwnProperty("loggedObject")) {
               this.loggedObject = this.message.loggedObject;
               this.message = this.message.message || this.message.msg || 
                              this.message.toString();
            }
            // Else we use the toString() method as the log message and 
            // the message itself as the loggedObject
            else {
               this.loggedObject = this.message;
               // Some browsers will ignore '' *and* the
               // accompanying logOject
               this.message = ' '; 
            }
            this.hasLoggedObject = true;
         }
         else {
            this.hasLoggedObject = false;
         }
      },
      
      /**
       * @private
       * 
       * Creates a new logging event.
       * 
       * @param cfg The basic log information.
       */
      constructor : function ( cfg ) {         
         Sm.log.util.Assert.assert(cfg);
         Sm.log.util.Assert.assert(cfg.time);
         Sm.log.util.Assert.assert(cfg.message !== undefined);
         Sm.log.util.Assert.assert(cfg.category);
         Sm.log.util.Assert.assert(cfg.level);

         Ext.apply( this, cfg );
         this.level = cfg.level.getName();
         this.levelLevel = cfg.level.getLevel();
         this.ndc = Sm.log.NDC.getNDCString() || '';
         this.handleMessage(this.message);
      }
   });
}());
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

(function() {
   "use strict"; //$NON-NLS-1$

   /**
    * This class provide a stack of 'marker' strings that helps track related
    * logging operations across different loggers.
    * 
    * It is equivalent to log4j's NDC.
    */
   Ext.define('Sm.log.NDC', { //$NON-NLS-1$
      singleton : true,
      
      uses : ['Sm.log.util.Assert'],
      
      config : {
         /**
          * @private
          * @cfg {Array}
          * 
          * 
          * The stack of NDC strings
          */ 
         stack : []
   
         /**
          * @method setStack
          * @private
          */
   
         /**
          * @method getStack
          * @private
          */
      },
      
      /**
       * Pushes a marker string.
       * 
       * @param {String} str The additional marker string.
       * 
       * @returns {void}
       */
      push : function(str) {
         this.stack.push(str);
      },
      
      /**
       * Removes the last marker string.
       * 
       * Don't return anything to discourage programmatic usage
       * 
       * @returns {void}
       */
      pop : function() {
         this.getStack().pop();
      },
      
      /**
       * @private Package access
       * 
       * Returns an string representing all marker strings, separated by '.'.
       * 
       * @returns {String} 
       *      An string representing all marker strings, separated by '.'.
       */
      getNDCString : function() {
        return this.getStack().join('.');
      },
      
      /**
       * @private Package access
       * 
       * Removes all markers.
       * 
       * @returns {void}
       */
      clear : function() {
         this.setStack([] );
      }
   });
}());
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

   /**
    * A layout that formats log data using an Extjs template.
    */
   Ext.define('Sm.log.TemplateLayout', { //$NON-NLS-1$
      extend : 'Sm.log.LayoutBase',
      
      uses : ['Sm.log.util.Assert'],

      /**
       * @protected
       * 
       * Returns a text representing a whole log entry.
       * 
       * Very useful for line-oriented output, like a browser console window.
       * 
       * @param {Sm.log.LoggingEvent} logEvent The log data.
       * @returns {String} A text representing a whole log entry.
       */
      formatLogAsText : function(logEvent) {
         // We can do as we want here, because we've been handed a personal
         // copy of logEvent
         return this.applyTemplate(logEvent);
      },

      /** 
       * Sets the template text for the underling Ext template.
       * 
       * @param {String} templateText
       * 
       * @returns {void}
       */
      setTemplate : function(templateText) {
         Sm.log.util.Assert.assert( templateText );
         
        this.template = new Ext.Template( templateText );
        this.template.compile();
      },
      
      /**
       * @protected
       * 
       * Returns the text generated by applying the template to a log entry.
       * 
       * @param {Sm.log.LoggingEvent} logCopy The log data.
       * @returns void
       */
      applyTemplate : function(log) {
         return this.template.apply(log);
      },

      /**
       * Create a new template layout.
       * 
       * @param cfg
       */
      constructor : function(cfg) {
         Sm.log.util.Assert.assert(cfg);
         Sm.log.util.Assert.assert(cfg.template);
         this.callParent(arguments);
         
         this.setTemplate(cfg.template);
      },
      
      statics : {
         /**
          * @static
          * 
          * Returns the default template layout, used by default by
          * all appenders.
          * 
          * @returns {Sm.log.TemplateLayout}
          */
         getDefaultLayout : function() {
            if( !this.defaultLayoutF) {
               this.defaultLayoutF = new Sm.log.TemplateLayout(
                  {template: 
                   '{formattedTime} {level} {ndc} ' +
                   '{category}: {formattedMessage}'} );               
            }
            return this.defaultLayoutF;
         }
      }

   });
}());
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

// PAGRemoteLogging
(function() {
   "use strict"; //$NON-NLS-1$

   /**
    * @private
    * 
    * An appender that performs remote logging using Direct for 
    * sending log information.
    * 
    * There are two standard remote appenders, one for log4j
    * (see {@link Sm.log.direct.DirectAppender#getLog4jAppender}), and
    * another one for slf4j (see 
    * {@link Sm.log.direct.DirectAppender#getSlf4jAppender}).
    * 
    * It is possible to define new remote appenders once they are
    * implemented at the server side.
    */
   Ext.define('Sm.log.direct.DirectAppender', { //$NON-NLS-1$
      extend : 'Sm.log.AppenderBase',
      
      config : {
         /**
          * @cfg (required)
          * @accessor
          * @readonly
          * 
          * The Direct action with the log operation
          * 
          */
         loggingAction : null
         
         /**
          * @private
          * @method setLoggingAction
          */
      },
      
      statics : {
         /**
          * @private
          * @static 
          * 
          * Ensures that the DirectJNgine log provider is registered, and 
          * only once.
          * 
          * @returns {void}
          */
         ensureStandardProviderRegistered : function () {
            var me = Sm.log.direct.DirectAppender, provider;
            if( !me.remotingApiRegistered) {
              provider = Ext.Direct.addProvider( 
                       Sm.log.direct.impl.REMOTING_API );
              provider.maxRetries = 0;
              provider.timeout = 15000;
            }
            me.remotingApiRegistered = true;
         },
         
         /**
          * @static
          * 
          * Returns the standard log4j DirectJNgine based appender.
          * 
          * @returns {Sm.log.direct.DirectAppender} 
          *           The standard log4j DirectJNgine based appender.
          */
         getLog4jAppender : function () {
            var me = Sm.log.direct.DirectAppender;
            me.ensureStandardProviderRegistered();
            if( !me.log4jAppender) {
               me.log4jAppender = new Sm.log.direct.DirectAppender(
                      {loggingAction: Sm.log.direct.impl.Log4jLogger});
             }
            return me.log4jAppender;
         },
         
         /**
          * @static
          * 
          * Returns the standard slf4j DirectJNgine based appender.
          * 
          * @returns {Sm.log.direct.DirectAppender}
          *          The standard slf4j DirectJNgine based appender.
          */
         getSlf4jAppender : function () {
            var me = Sm.log.direct.DirectAppender;
            Sm.log.direct.DirectAppender.ensureStandardProviderRegistered();
            if( !me.slf4jAppender) {
               me.slf4jAppender = new Sm.log.direct.DirectAppender(
                        {loggingAction: Sm.log.direct.impl.Slf4jLogger});
             }
             return me.slf4jAppender;
         }
      },
      
      /**
       * Creates a new remote appender, passing the Direct action that
       * provides the log operation.
       * 
       * Of course, you must make sure that the provider for that action
       * is already registered.
       * 
       * @param {Object} cfg 
       *        The Direct action that provides the log operation.
       */      
      constructor : function(cfg) {
         this.callParent(cfg);
         Sm.log.util.Assert.assert(cfg.loggingAction);
         
         // We need a layout that does not highlight logged objects,
         // for remote loggers do not understand HTML as a rule
         this.setLayout(new Sm.log.LayoutBase());
         this.getLayout().highlightLoggedObject = false;
      },
      
      /**
       * @protected
       * 
       * @inheritDoc
       */
      doLog : function(logEvent) {
         // Add data that is relevant to server
         logEvent.timeMillis = logEvent.time.getTime();
         
         // Remove data that is irrelevant to server
         delete logEvent.time;    // Wants timeMillis & formattedTime
         delete logEvent.message; // Wants formattedMessage
         delete logEvent.formatParams; // Server can't format with js object
         delete logEvent.loggedObject; // Server can't cope with js object
         delete logEvent.levelLevel;   // Makes no sense for server
         
         this.getLoggingAction().log(logEvent);
      }
   });
}());
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

(function() {
   "use strict"; //$NON-NLS-1$
   
   /**
    * @private
    * 
    * Provides assertion support
    */
   Ext.define('Sm.log.util.Assert', { //$NON-NLS-1$
      
      uses : [
         'Sm.log.util.Debug' //$NON-NLS-1$
      ],

      singleton : true,
      
      ON : true,
      
      assert : function(booleanExpression, errorMsg) {
         if( Sm.log.util.Assert.ON !== true ) {
            return;
         }
         var error;
         if( !booleanExpression ) {
            error = 'AssertionError'; //$NON-NLS-1$
            /*global console:true*/
            if( errorMsg) {
               error += ': ' + errorMsg;
            }
            console.log( error ); //$NON-NLS-1$
            /*global console:false*/

            Sm.log.util.Debug.abort(error);
         }
      }
   });

}());
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

(function() {
   "use strict"; //$NON-NLS-1$
   
   /**
    * @private
    * 
    * Provides debug support.
    */
   Ext.define('Sm.log.util.Debug', { //$NON-NLS-1$
      
      singleton : true,
      
      ON : false,
      
      abort : function(errorMsg) {
         var msg = "ABORT"; //$NON-NLS-1$
         if( errorMsg ) {
             msg += ": " + errorMsg; //$NON-NLS-1$
         }
         /*global console:true */
         console.log( msg );
         /*global console:false */
         // If we are in a debugging environment, cause the debugger to
         // take control
         /*jslint debug:true */
//         debugger; // OK, YUI does not like this
         /*jslint debug:false */
         
         // When not in a debugging environment, we generate the kind of
         // error that will be easiest to be catch: throwing an exception
         // does not work that well in some environments
         this.abortAndAttemptToAwakeDebuggerIfPresent();
      },
      abortWhenCalled: function(errorMsg) {
         return function() {
            Sm.log.util.Debug.abort(errorMsg);
         };
      }
   });

}());
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
