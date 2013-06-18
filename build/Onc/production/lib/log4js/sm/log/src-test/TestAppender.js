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

/*jslint strict: false */

(function() {
   // "use strict"; //$NON-NLS-1$

   Ext.define('Sm.log.test.TestAppender', { //$NON-NLS-1$
      extend: 'Sm.log.AppenderBase',

      logs : [],
      
      clear : function() {
         this.logs = [];
      },
      
      doLog : function(logEvent) {
         this.logs.push(logEvent);
      },
      
      last : function() {
         if( this.logs.length === 0 ) {
            return null;
         }
         return this.logs[this.logs.length - 1];
      },
      
      pop : function() {
         return this.logs.pop();
      },
      
      count : function() {
         return this.logs.length;
      },
      
      constructor : function(cfg) {
         this.callParent(arguments); // callParent(cfg) won't work (?)
         this.clear();
      }
   });
   
}());