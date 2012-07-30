var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title: 'ONC Test Suite',
    loaderPath:
    {
        'Onc' : 'app',
    },

    preload: [
        "ext-4.1/resources/css/ext-all.css",
        "ext-4.1/ext-all.js",
    ]
});


Harness.start({
    group: 'Sanity',
    items: [
        'tests/010_sanity.t.js'
    ]
});
