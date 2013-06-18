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
  assertTrue: true, assertFalse: true,
  assertEquals: true, assertNotNull: true */
(function() {
   "use strict"; //$NON-NLS-1$
   
   /*jslint newcap : false */ 
   TestCase("LoggerJtdTest", {
      appender : null, 
      
      logger : null,
      
      setUp : function() {
         this.testAppender = new Sm.log.test.TestAppender();
         Sm.log.Logger.getRoot().setLevel(Sm.log.Level.INFO );
         Sm.log.Logger.getRoot().removeAllAppenders();
         Sm.log.Logger.enabled = true;
      },
      
      tearDown : function() {
         this.testAppender.clear();
      },
      
      getTime : function() {
         return (new Date()).getTime();
      },
      
      getUniqueId : function () {
         if( !this.id) {
           this.id = this.getTime();
         }
         this.id = this.id + 1;
         return this.id.toString();
      },
      
      createUniqueLogger : function( levels ) {
         var category = "z" + this.getUniqueId();
         
         while( levels > 1 ) {
            levels = levels - 1;
            category = category + "." + "a";
         }
         
         return Sm.log.Logger.getLogger(category);
      },
      
      createLoggerWithTestAppender : function () {
         var logger = this.createUniqueLogger(1);
         logger.setLevel( Sm.log.Level.INFO);
         logger.addAppender( this.testAppender );
         return logger;
      },
      
      testLog : function() {
         var log, logger = this.createLoggerWithTestAppender();
   
         logger.log( Sm.log.Level.WARN, "Log");
         log = this.testAppender.pop();
         assertEquals( Sm.log.Level.WARN.name, log.level );  
         assertEquals( "Log", log.message );  
      },
      
      testSetLevel : function() {
         var log, logger = this.createLoggerWithTestAppender();
   
         logger.setLevel( Sm.log.Level.ERROR );
         
         this.testAppender.clear();
         logger.log( Sm.log.Level.ERROR, "Log");      
         assertEquals( 1, this.testAppender.count() );
   
         this.testAppender.clear();
         logger.log( Sm.log.Level.WARN, "Log");      
         assertEquals( 0, this.testAppender.count() );  
   
         this.testAppender.clear();
         logger.log( Sm.log.Level.INFO, "Log");      
         assertEquals( 0, this.testAppender.count() );  
         
         this.testAppender.clear();
         logger.log( Sm.log.Level.DEBUG, "Log");      
         assertEquals( 0, this.testAppender.count() );  
         
         this.testAppender.clear();
         logger.log( Sm.log.Level.TRACE, "Log");      
         assertEquals( 0, this.testAppender.count() );  
         
         this.testAppender.clear();
         logger.log( Sm.log.Level.FATAL, "Log");      
         assertEquals( 1, this.testAppender.count() );  
      },
      
      testGetLoggerForEmptyCategory : function() {
         assertEquals( Sm.log.Logger.getLogger(''), 
                       Sm.log.Logger.getRoot() );
      },
      
      testGetLoggerForNestedCategories : function() {
         var l1, l2, l3, l4;
   
         l4 = Sm.log.Logger.getLogger('2.3.4');
         assertNotNull(l4);
         assertEquals( '2.3.4', l4.getCategory());
         
         l3 = l4.parentLogger;
         assertNotNull(l3);
         assertEquals( Sm.log.Logger.getLogger('2.3'), l3 );
         
         l2 = l3.parentLogger;
         assertNotNull(l2);
         assertEquals( Sm.log.Logger.getLogger('2'), l2 );
         
         l1 = l2.parentLogger;
         assertNotNull(l1);
         assertEquals( Sm.log.Logger.getRoot(), l1 );
      },
      
      testGetEffectiveLevel : function () {
         var root = Sm.log.Logger.getRoot(), l2, l3;
         l3 = this.createUniqueLogger(2);
         l2 = l3.parentLogger;
         
         assertEquals( l3.getLevel(), null );
         assertEquals( l3.getEffectiveLevel(), root.getLevel());
         assertEquals( l2.getLevel(), null );
         assertEquals( l2.getEffectiveLevel(), root.getLevel());
         
         root.setLevel( Sm.log.Level.WARN );
         assertEquals( l3.getLevel(), null );
         assertEquals( l3.getEffectiveLevel(), Sm.log.Level.WARN);
         assertEquals( l2.getEffectiveLevel(), Sm.log.Level.WARN);
         
         // Try now adding higher level to intermediate logger
         l2.setLevel( Sm.log.Level.ERROR);
         assertEquals( l3.getEffectiveLevel(), Sm.log.Level.ERROR);
         assertEquals( l2.getEffectiveLevel(), Sm.log.Level.ERROR);
   
         // Remove intermedite logger level, so 
         // effective level is the one in root
         l2.setLevel( null);
         assertEquals( l3.getEffectiveLevel(), root.getLevel());
         assertEquals( l2.getEffectiveLevel(), root.getLevel());
      },
      
      testLogRespectsHerarchicalLevels : function () {
         var root = Sm.log.Logger.getRoot(), l2, l3;
         l3 = this.createUniqueLogger(2);
   
         l3.addAppender( this.testAppender );
         l2 = l3.parentLogger;
   
         // Logging controlled by root level
         this.testAppender.clear();
         l3.log( Sm.log.Level.DEBUG, "Log");      
         assertEquals( 0, this.testAppender.count() );
   
         this.testAppender.clear();
         l3.log( Sm.log.Level.INFO, "Log");  
         assertEquals( 1, this.testAppender.count() );
   
         // Logging now controlled by l2
         this.testAppender.clear();
         l2.setLevel( Sm.log.Level.DEBUG );
         l3.log( Sm.log.Level.DEBUG, "Log");      
         assertEquals( 1, this.testAppender.count() );
   
         this.testAppender.clear();
         l2.setLevel( Sm.log.Level.WARN );
         l3.log( Sm.log.Level.DEBUG, "Log");      
         assertEquals( 0, this.testAppender.count() );
   
         this.testAppender.clear();
         l2.setLevel( Sm.log.Level.WARN );
         l3.log( Sm.log.Level.WARN, "Log");      
         assertEquals( 1, this.testAppender.count() );
   
         // Logging now controlled by l3
         this.testAppender.clear();
         l2.setLevel( Sm.log.Level.ERROR );
         l3.setLevel( Sm.log.Level.DEBUG );
         l3.log( Sm.log.Level.DEBUG, "Log");      
         assertEquals( 1, this.testAppender.count() );
   
         // Logging now controlled by l2 again
         this.testAppender.clear();
         l3.setLevel( null );
         l2.setLevel( Sm.log.Level.ERROR );
         l3.log( Sm.log.Level.DEBUG, "Log");      
         assertEquals( 0, this.testAppender.count() );
         l3.log( Sm.log.Level.ERROR, "Log");      
         assertEquals( 1, this.testAppender.count() );
   
         // Logging now controlled by root again
         this.testAppender.clear();
         l2.setLevel( null );
         l3.log( Sm.log.Level.TRACE, "Log");      
         assertEquals( 0, this.testAppender.count() );
         l3.log( Sm.log.Level.INFO, "Log");      
         assertEquals( 1, this.testAppender.count() );
      },
      
      testLogUsesParentAppenders : function () {
         var root = Sm.log.Logger.getRoot(), l2, l3;
         l3 = this.createUniqueLogger(2);
         l2 = l3.parentLogger;
         l3.addAppender( this.testAppender );
         l3.addAppender( this.testAppender );
         l2.addAppender( this.testAppender );
         root.addAppender( this.testAppender );      
   
         this.testAppender.clear();
         l3.log( Sm.log.Level.FATAL, "Log");      
         assertEquals( 4, this.testAppender.count() );
         
         this.testAppender.clear();
         l3.removeAppender( this.testAppender);
         l3.log( Sm.log.Level.FATAL, "Log");      
         assertEquals( 3, this.testAppender.count() );
   
         this.testAppender.clear();
         l3.removeAppender( this.testAppender);
         l3.log( Sm.log.Level.FATAL, "Log");      
         assertEquals( 2, this.testAppender.count() );
   
         this.testAppender.clear();
         l2.removeAppender( this.testAppender);
         l3.log( Sm.log.Level.FATAL, "Log");      
         assertEquals( 1, this.testAppender.count() );
      },
      
      testNdc : function() {
         var l = this.createLoggerWithTestAppender(), le;
         l.addAppender( this.testAppender );
         
         l.log( Sm.log.Level.FATAL, "Log");      
         le = this.testAppender.pop();
         assertEquals( '', le.ndc );
         
         Sm.log.NDC.push( "a");
         Sm.log.NDC.push( "p");
         l.log( Sm.log.Level.FATAL, "Log");      
         le = this.testAppender.pop();
         assertEquals( 'a.p', le.ndc );
         
         Sm.log.NDC.pop();
         l.log( Sm.log.Level.FATAL, "Log");      
         le = this.testAppender.pop();
         assertEquals( 'a', le.ndc );      
   
         Sm.log.NDC.pop();
         l.log( Sm.log.Level.FATAL, "Log");      
         le = this.testAppender.pop();
         assertEquals( '', le.ndc );      
      },

      testAppenderAdditivity : function () {
         var l1, l2 = this.createUniqueLogger(2), le;
         this.testAppender.clear();
         l1 = l2.parentLogger;
         l2.addAppender( this.testAppender);
         l1.addAppender( this.testAppender);
         
         // Parent appenders are not called
         l2.setAdditivity(false);     
         l2.info( "info");
         assertEquals( 1, this.testAppender.count() );
         this.testAppender.pop();

         // Parent appenders are called
         l2.setAdditivity(true);     
         l2.info( "info");
         assertEquals( 2, this.testAppender.count() );
      },
      
      testLogFunctions : function() {
         var l = this.createLoggerWithTestAppender(), le;
         l.setLevel( Sm.log.Level.ALL);
         
         l.trace( "trace");
         le = this.testAppender.pop();
         assertEquals( "TRACE", le.level);

         l.debug( "debug");
         le = this.testAppender.pop();
         assertEquals( "DEBUG", le.level);

         l.info( "info");
         le = this.testAppender.pop();
         assertEquals( "INFO", le.level);

         l.warn( "warn");
         le = this.testAppender.pop();
         assertEquals( "WARN", le.level);

         l.error( "error");
         le = this.testAppender.pop();
         assertEquals( "ERROR", le.level);

         l.fatal( "fatal");
         le = this.testAppender.pop();
         assertEquals( "FATAL", le.level);
      },
      
      testIsXXXEnabledFunction : function() {
         var l = this.createLoggerWithTestAppender(), le;

         l.setLevel( Sm.log.Level.TRACE);         
         assertTrue( l.isFatalEnabled() );
         assertTrue( l.isErrorEnabled() );
         assertTrue( l.isWarnEnabled() );
         assertTrue( l.isInfoEnabled() );
         assertTrue( l.isDebugEnabled() );
         assertTrue( l.isTraceEnabled() );

         l.setLevel( Sm.log.Level.DEBUG);         
         assertTrue( l.isFatalEnabled() );
         assertTrue( l.isErrorEnabled() );
         assertTrue( l.isWarnEnabled() );
         assertTrue( l.isInfoEnabled() );
         assertTrue( l.isDebugEnabled() );
         assertFalse( l.isTraceEnabled() );

         l.setLevel( Sm.log.Level.INFO);         
         assertTrue( l.isFatalEnabled() );
         assertTrue( l.isErrorEnabled() );
         assertTrue( l.isWarnEnabled() );
         assertTrue( l.isInfoEnabled() );
         assertFalse( l.isDebugEnabled() );
         assertFalse( l.isTraceEnabled() );

         l.setLevel( Sm.log.Level.WARN);         
         assertTrue( l.isFatalEnabled() );
         assertTrue( l.isErrorEnabled() );
         assertTrue( l.isWarnEnabled() );
         assertFalse( l.isInfoEnabled() );
         assertFalse( l.isDebugEnabled() );
         assertFalse( l.isTraceEnabled() );

         l.setLevel( Sm.log.Level.ERROR);         
         assertTrue( l.isFatalEnabled() );
         assertTrue( l.isErrorEnabled() );
         assertFalse( l.isWarnEnabled() );
         assertFalse( l.isInfoEnabled() );
         assertFalse( l.isDebugEnabled() );
         assertFalse( l.isTraceEnabled() );

         l.setLevel( Sm.log.Level.FATAL);         
         assertTrue( l.isFatalEnabled() );
         assertFalse( l.isErrorEnabled() );
         assertFalse( l.isWarnEnabled() );
         assertFalse( l.isInfoEnabled() );
         assertFalse( l.isDebugEnabled() );
         assertFalse( l.isTraceEnabled() );

         l.setLevel( Sm.log.Level.NONE);         
         assertFalse( l.isFatalEnabled() );
         assertFalse( l.isErrorEnabled() );
         assertFalse( l.isWarnEnabled() );
         assertFalse( l.isInfoEnabled() );
         assertFalse( l.isDebugEnabled() );
         assertFalse( l.isTraceEnabled() );
      },
      
      testDefaultMessageFormatting : function() {
         // Direct parameter substitution
         var l = this.createLoggerWithTestAppender(), le;
         l.info( "Msg {0}, {1} {2}", "x", 33);
         le = this.testAppender.pop();
         assertEquals( "Msg x, 33 {2}", le.formattedMessage );

         // Object properties based substitution
         l.info( "Msg {a}, {b} {c} {d}", {a: 'y', d: true}, {c:40});
         le = this.testAppender.pop();
         assertEquals( "Msg y, {b} 40 true", le.formattedMessage );
         
         // Primitive values
         l.info( true );
         le = this.testAppender.pop();
         assertEquals( "true", le.formattedMessage );
         l.info( 25 );
         le = this.testAppender.pop();
         assertEquals( "25", le.formattedMessage );
      },
      
      testLoggedObjectUsage : function() {
         // Direct object logging
         var l = this.createLoggerWithTestAppender(), le, obj;
         obj = {value: 5};
         l.info(obj);
         le = this.testAppender.pop();         
         assertEquals( obj, le.loggedObject );
         assertEquals( ' ', le.message );

         // Object with message & loggedObject logging
         obj = {message: 'msg', loggedObject: 5};
         l.info(obj);
         le = this.testAppender.pop();         
         assertEquals( 5, le.loggedObject );
         assertEquals( 'msg', le.message );
         
         // No loggedObject logging
         l.info( "msg2");
         le = this.testAppender.pop();         
         assertTrue( le.loggedObject === undefined );
         assertEquals( 'msg2', le.message );
      },
      
      testSetEnabled : function () {
         var l = this.createLoggerWithTestAppender(), le;
         l.enabled = false;
         l.info( "info");
         assertEquals( 0, this.testAppender.count() );
         
         l.enabled = true;
         l.info( "info");
         assertEquals( 1, this.testAppender.count() );
      },
      
      testEnablingRespectsGlobalLogEnableState : function () {
         var l = this.createLoggerWithTestAppender(), le;
         Sm.log.Logger.enabled = false;
         l.info( "info");
         assertEquals( 0, this.testAppender.count() );
         
         Sm.log.Logger.enabled = true;
         l.info( "info");
         assertEquals( 1, this.testAppender.count() );
      }
      
    });

}());