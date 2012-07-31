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