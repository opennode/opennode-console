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