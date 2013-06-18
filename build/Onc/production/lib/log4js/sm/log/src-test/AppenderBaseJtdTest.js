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
   TestCase("AppenderBaseJtdTest", {
      createFakeLog : function (cfg) {
         var result, fakeLog;
         
         fakeLog= {
            message : 'Msg',
            time : new Date( 2000, 1, 30),
            category : 'X.Y.Z',
            level : Sm.log.Level.INFO, 
            levelLevel : Sm.log.Level.INFO.getLevel()
         };
         Ext.apply( fakeLog, cfg);
         result = new Sm.log.LoggingEvent(fakeLog);
         return result;
      },
      
      testHtmlEncodedLogEventProperties : function() {
         var appender, logger, le; 
         appender = new Sm.log.test.TestAppender( 
                  {htmlEncodedLogEventProperties : 
                     ["message", "loggedObject"]});
         appender.log( this.createFakeLog(
                  {category: '>', message:'>', loggedObject: '>'}));
         le = appender.pop();
         // message and loggedObject are encoded, but category not
         assertEquals( "&gt;", le.message);
         assertEquals( "&gt;", le.loggedObject);
         assertEquals( ">", le.category);
      },
      
      testStopLogging : function () {
         var appender, logger, le; 
         appender = new Sm.log.test.TestAppender();
         appender.stopLogging();
         appender.log( this.createFakeLog() );
         assertEquals( 0, appender.count() );
      },
      
      testStartLogging : function () {
         var appender, logger, le; 
         appender = new Sm.log.test.TestAppender();
         appender.stopLogging();
         appender.log( this.createFakeLog() );
         assertEquals( 0, appender.count() );

         // When start/restart logging, logs sent while stopping are lost
         appender.startLogging();
         assertEquals( 0, appender.count() );
         appender.log( this.createFakeLog() );
         assertEquals( 1, appender.count() );
      }
      

   });

}());