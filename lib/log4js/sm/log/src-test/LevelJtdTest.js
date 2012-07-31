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

/*global TestCase: true, 
  assertTrue: true, assertEquals: true, assertNotNull: true */
(function() {
   "use strict"; //$NON-NLS-1$
   
   /*jslint newcap : false */
   TestCase("LevelJtdTest", {
      testLevelOrdering : function() {
   /* jslint newcap : true */
         var log;
   
         assertTrue( Sm.log.Level.NONE.le(Sm.log.Level.NONE) );  
         assertTrue( Sm.log.Level.NONE.le(Sm.log.Level.NONE) );  
         
         assertTrue( Sm.log.Level.FATAL.le(Sm.log.Level.FATAL) );  
         assertTrue( Sm.log.Level.ERROR.le(Sm.log.Level.FATAL) );  
         assertTrue( Sm.log.Level.ERROR.le(Sm.log.Level.ERROR) );  
         assertTrue( Sm.log.Level.WARN.le(Sm.log.Level.FATAL) );  
         assertTrue( Sm.log.Level.WARN.le(Sm.log.Level.ERROR) );  
         assertTrue( Sm.log.Level.WARN.le(Sm.log.Level.WARN) );  
         assertTrue( Sm.log.Level.INFO.le(Sm.log.Level.FATAL) );  
         assertTrue( Sm.log.Level.INFO.le(Sm.log.Level.ERROR) );  
         assertTrue( Sm.log.Level.INFO.le(Sm.log.Level.WARN) );  
         assertTrue( Sm.log.Level.INFO.le(Sm.log.Level.INFO) );  
         assertTrue( Sm.log.Level.DEBUG.le(Sm.log.Level.FATAL) );  
         assertTrue( Sm.log.Level.DEBUG.le(Sm.log.Level.ERROR) );  
         assertTrue( Sm.log.Level.DEBUG.le(Sm.log.Level.WARN) );  
         assertTrue( Sm.log.Level.DEBUG.le(Sm.log.Level.INFO) );  
         assertTrue( Sm.log.Level.DEBUG.le(Sm.log.Level.DEBUG) );  
         assertTrue( Sm.log.Level.TRACE.le(Sm.log.Level.FATAL) );  
         assertTrue( Sm.log.Level.TRACE.le(Sm.log.Level.ERROR) );  
         assertTrue( Sm.log.Level.TRACE.le(Sm.log.Level.WARN) );  
         assertTrue( Sm.log.Level.TRACE.le(Sm.log.Level.INFO) );  
         assertTrue( Sm.log.Level.TRACE.le(Sm.log.Level.DEBUG) );  
         assertTrue( Sm.log.Level.TRACE.le(Sm.log.Level.TRACE) );
         
         assertTrue( Sm.log.Level.ALL.le(Sm.log.Level.FATAL) );  
         assertTrue( Sm.log.Level.ALL.le(Sm.log.Level.TRACE) );  
      },
      
      testGetLevel : function() {
         // Test case insensitive
         assertEquals( Sm.log.Level.WARN.getLevel(), 
                       Sm.log.Level.getLevelLevel( "waRN"));
      }
   
    });

}());