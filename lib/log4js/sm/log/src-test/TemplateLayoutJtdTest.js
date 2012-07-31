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
   TestCase("TemplateLayoutJtdTest", {
      testSetTemplate : function () {
   /* jslint newcap : true */
         var appender, logger, le, now, layout; 
         // We do not instantiate a layout because we are using
         // the default layout, which is as good a any other one
         layout = new Sm.log.TemplateLayout(
                  {template:"-{formattedMessage}-"});
         appender = new Sm.log.test.TestAppender();
         appender.setLayout(layout);
         logger = Sm.log.Logger.getLogger("testAppendFormattedData");
         logger.addAppender(appender);

         // Check template
         logger.info( "msg" );
         le = appender.pop();     
         assertEquals( "-msg-", layout.formatLogAsText(le));
         
         // Check we use date format too in the template
         layout.timeFormat = "Y";
         layout.setTemplate( "{formattedTime}-{formattedMessage}@");
         now= new Date();
         logger.info( "msg" );
         le = appender.pop();     
         assertEquals( now.getFullYear().toString() + "-msg@", 
                  layout.formatLogAsText(le));
      },

      testTimeFormat : function () {
         var appender, logger, le, now, layout; 
         // We do not instantiate a layout because we are using
         // the default layout, which is as good a any other one
         layout = new Sm.log.TemplateLayout(
                  {template:"-{formattedMessage}-"});
         appender = new Sm.log.test.TestAppender();
         appender.setLayout(layout);
         logger = Sm.log.Logger.getLogger("testAppendFormattedData");
         logger.addAppender(appender);
         
         layout.timeFormat = "Y";
         now= new Date();
         logger.info( "msg" );
         le = appender.pop();     
         assertEquals( now.getFullYear().toString(), le.formattedTime );

      },
      
      testFormatLogAsText : function() {
         // So that we do not think we don't test formatLogAsText 
         // because there is no immediately obvious test function for it
         this.testSetTemplate();
      }      
      
    });

}());
