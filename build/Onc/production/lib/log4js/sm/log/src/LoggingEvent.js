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