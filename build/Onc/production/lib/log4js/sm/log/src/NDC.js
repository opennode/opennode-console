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