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
   TestCase("NDCJtdTest", {
      /* jslint newcap : true */
      setUp : function() {
         Sm.log.NDC.clear();
      },
      
      tearDown : function() {
         Sm.log.NDC.clear();
      },
      
      testPush : function() {
         assertEquals( Sm.log.NDC.getNDCString(), '' );
         Sm.log.NDC.push( "x" );
         assertEquals( Sm.log.NDC.getNDCString(), 'x' );
         Sm.log.NDC.push( "y" );
         assertEquals( Sm.log.NDC.getNDCString(), 'x.y' );
      },
      
      testPop : function() {
         Sm.log.NDC.push( "x" );
         Sm.log.NDC.push( "y" );
         Sm.log.NDC.push( "z" );

         Sm.log.NDC.pop();
         assertEquals( Sm.log.NDC.getNDCString(), 'x.y' );
         Sm.log.NDC.pop();
         assertEquals( Sm.log.NDC.getNDCString(), 'x' );
         Sm.log.NDC.pop();
         assertEquals( Sm.log.NDC.getNDCString(), '' );
      },
   
      testGetNDCString : function() {
         assertEquals( Sm.log.NDC.getNDCString(), '' );
         Sm.log.NDC.push( "x" );
         assertEquals( Sm.log.NDC.getNDCString(), 'x' );
         Sm.log.NDC.push( "y" );
         assertEquals( Sm.log.NDC.getNDCString(), 'x.y' );
      }
    });

}());