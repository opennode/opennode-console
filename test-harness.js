var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title: 'ONC Test Suite',

    preload: [
        "ext-4.1/resources/css/ext-all.css",
        "ext-4.1/ext-all.js",
        {   text: "Ext.Loader.setConfig('paths', {" +
                  "'Ext': 'ext-4.1/src'," +
                  "'Onc': './app/Onc'," +
                  "'Ext.ux': 'ext-4.1/examples/ux' }); " + 
                  "Ext.Loader.setConfig({ enabled : true})"
        },
        "log4js/sm/log/log4js-ext-all.js",
        "support.js",
        "util.js",
        "conf-default.js",
        "config.js",
        "app.js"
    ]
});


Harness.start({
    group: 'Sanity',
    items: [
        'tests/010_sanity.t.js'
    ]
});
