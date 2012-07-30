StartTest(function(t) {
    t.diag("Sanity test, loading classes on demand and verifying they were indeed loaded.");

    t.ok(Ext, 'ExtJS is here');

    t.requireOk('Onc.controller.ComputeController');
    t.requireOk('Onc.controller.MainController');

});
