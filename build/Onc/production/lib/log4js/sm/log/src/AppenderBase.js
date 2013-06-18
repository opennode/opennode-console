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