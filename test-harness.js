var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title: 'ONC Test Suite',
    overrideSetTimeout : false,

    preload: [
        "lib/ext-4.1/resources/css/ext-all.css",
        "lib/ext-4.1/ext-all.js",
        {
            text: 
            	"Ext.Loader.setConfig('paths', {" +
            		"'Ext': 'lib/ext-4.1/src'," +
            		"'Onc': './app'," +
            		"'Ext.ux': 'lib/ext-4.1/examples/ux' }); " +
                "Ext.Loader.setConfig({ enabled : true})"
        },
        "lib/log4js/sm/log/log4js-ext-all.js",
        "support.js",
        "util.js",
        "conf-default.js",
        "config.js",
        "app.js",

        "lib/term/ShellInABox.js",
        "lib/term/jquery.min.js",
//        "lib/term/knockout-1.2.1.js",
//        "lib/novnc/vnc.js"
        "tests/utils/generalFunctions.js"

    ]
});


Harness.start(
	
	{
		group: 'Sanity',
		items: [
		        'tests/010_sanity/010_sanity.t.js'
		        ]
	},
	{
		group: 'Administrator',
		items: [
		        
		    	{

		    		group: 'Visible elements',
		    		items: [

		    		        'tests/administrator/020_visibility/020_admin_tabs_buttons.t.js'
		    		        ]
		    	},
				{
		    		group: 'VM management',
					items: [
	
					        'tests/administrator/030_VMmanagement/030_add_VM.t.js'
					        ]
				}
		        ]
	},
	{
		group: 'User',
		items: [
		        
		    	{

		    		group: 'Visible elements',
		    		items: [

		    		        'tests/user/020_visibility/021_user_tabs_buttons.t.js'
		    		        ]
		    	}
		        ]
	}
);
