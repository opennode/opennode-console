var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title: 'ONC Test Suite',
    isReadyTimeout : 30000,

    preload: [
        "lib/ext-4.1/resources/css/ext-all.css",
        "lib/ext-4.1/ext-all.js",
        {
            text: "Ext.Loader.setConfig('paths', {" +
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

		group: 'Visible elements',
		items: [

		        'tests/020_visibility/020_admin_tabs_buttons.t.js',
		        'tests/020_visibility/030_user_tabs_buttons.t.js'
		        ]
	}
);
