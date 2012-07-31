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
   //"use strict"; //$NON-NLS-1$

   var logger, logViewer, logViewerAppender, tbar, 
       createLogToolbar, createExampleLogs, doLog, setRootLoggerLevel;

   createLogToolbar = function() {
      tbar = Ext.create( 'Ext.toolbar.Toolbar', {
         renderTo : Ext.getBody(),         
         items : [ 
            { xtype: 'tbtext', text : 'Logger:'},
            { xtype: 'textfield', value: 'Sm.log.Logger1', 
               id: 'loggerNameId' },
            { xtype: 'tbtext', text : 'Text:'},
            { xtype: 'textfield', value: 'A log ext', id : 'logTextId'},
            { xtype: 'tbtext', text : 'Level:'},
            { xtype: 'combo', text: 'Level', id : 'logLevelId', width: 75,
               forceSelection: true, value : 'INFO', 
               store : ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']
            },
            { xtype: 'button', text : 'Log', handler: doLog },
            '-',
            { xtype: 'button', text : 'Create example logs', 
               handler: createExampleLogs },
            '-',
            { xtype: 'tbtext', text : 'Set root logger level:'},
            { xtype: 'combo', text: 'Level',
               forceSelection: true, value : 'INFO',  width: 75,
               listeners : { change : setRootLoggerLevel},
               store : ['NONE', 'FATAL', 'ERROR', 
                        'WARN', 'INFO', 'DEBUG', 'TRACE']
            }
         ]
      });
   };
   
   doLog = function( button ) {
      var levelName, level, loggerName, logText, logger;
      
      loggerName = Ext.getCmp( "loggerNameId").getValue();
      logText = Ext.getCmp( "logTextId" ).getValue() || '';
      levelName = Ext.getCmp( "logLevelId").getValue();
      
      level = Sm.log.Level.getLevel(levelName);
      logger = Sm.log.Logger.getLogger(loggerName);
      
      logger.log( level, logText );
   };
      
   createExampleLogs = function () {
      var logger, obj;
      logger = Sm.log.Logger.getLogger( 'Sm.log.example1'); 

      logger.trace("Trace log");
      logger.trace("Debug log");
      logger.info( "Info log:\ntext is strewn \n across several \nlines.\n" +
                   "Take a look in the detail view to see that!");
      logger.warn( "Warn with formatting, level={0} (text substitutions={1})", 
                   "WARN", 2);
      logger.error( "Error with formatting, level={type} " +
                    "(text substitutions={count})", 
                    {type: "ERROR", count: 3});
      // Log an object, so that we can later take a look at it
      obj = { name: 'John&John', 
              dog: {name: 'Spottie', hair: 'brown',
                    hardTextForHtml: '<&><pre>hi</pre>'},
                    ratings: [2500]};
      logger.fatal( {msg: 'Logged an object...', loggedObject: obj});

      logger.trace( "Now we'll log all sort of objects, so that you can see " +
                    "what they look like in the log window");
      logger.trace({msg:"A null logged object", loggedObject: null});
      logger.trace({msg:"A string logged object", loggedObject: "logged"});
      logger.trace({msg:"An integer logged object", loggedObject: 3});
      logger.trace({msg:"A date logged object", loggedObject: new Date()});
      logger.trace({msg:"An undefined logged object", loggedObject: undefined});
      logger.trace({msg:"An empty string logged object", loggedObject: ''});
      logger.trace({msg:"An true logged object", loggedObject: true});
      logger.trace({msg:"A false logged object", loggedObject: false});
      logger.trace({msg:"A 0 number logged object", loggedObject: 0});
   };
   
   setRootLoggerLevel = function( combo ) {
      var level = Sm.log.Level.getLevel( combo.getValue() );
      Sm.log.Logger.getRoot().setLevel( level ); 
   };
   
   Ext.tip.QuickTipManager.init();
   
   Ext.onReady( function() {
      // We do this at the very beginning so that it keep accumulating
      // log information even though there is not viewer window yet.
      // In this example, we can create both at the same time, but in some
      // programs that might not be feasible.
      logViewerAppender = new Sm.log.LogViewerAppender();
      
      // We must attach appenders to one or more loggers: 
      // by attaching an appender to the root logger, all logger will
      // use it (unless the logger has its additiviyt se to false)
      Sm.log.Logger.getRoot().addAppender(logViewerAppender);
      
      // Log something
      Sm.log.Logger.getLogger( 'Logger1').info( 'Hello, world!');

      // Create a toolbar that allows entering our own log information, to
      // test logging
      createLogToolbar();
      
      // Create a log window
      logViewer = new Sm.log.LogViewerWindow( {appender : logViewerAppender} );
      logViewer.show();
  });
   
}());