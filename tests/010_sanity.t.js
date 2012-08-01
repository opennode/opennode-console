StartTest(function(t) {
    t.diag("Sanity test, loading classes on demand and verifying they were indeed loaded.");

    t.diag("Libraries:");

    t.ok(Ext, 'ExtJS is here');
    t.ok(Sm.log.Logger.getRoot(), 'Log4JS is here');

    t.diag("Core classes:");

    t.requireOk('Onc.core.Backend');
    t.requireOk('Onc.core.Proxy');
    t.requireOk('Onc.core.Store');
    t.requireOk('Onc.core.EventBus');

    t.requireOk('Onc.core.polymorphic.Reader');
    t.requireOk('Onc.core.polymorphic.Association');

    t.requireOk('Onc.core.util.Deferred');
    t.requireOk('Onc.core.util.Scheduler');

    t.requireOk('Onc.core.hub.Hub');
    t.requireOk('Onc.core.hub.Subscription');
    t.requireOk('Onc.core.hub.Sync');

    t.requireOk('Onc.core.manager.ComputeManager');

    t.requireOk('Onc.core.ui.widgets.Tagger');
    t.requireOk('Onc.core.ui.widgets.Gauge');
    t.requireOk('Onc.core.ui.widgets.Shell');
    t.requireOk('Onc.core.ui.widgets.Vnc');

    t.requireOk('Onc.core.ui.components.ComputeGauge');
    t.requireOk('Onc.core.ui.components.MemoryGauge');
    t.requireOk('Onc.core.ui.components.CPUGauge');
    t.requireOk('Onc.core.ui.components.NetworkGauge');
    t.requireOk('Onc.core.ui.components.DiskGauge');

    t.diag("MVC classes:");

    t.requireOk('Onc.controller.ComputeController');
    t.requireOk('Onc.controller.ComputeStateController');
    t.requireOk('Onc.controller.EditVmController');
    t.requireOk('Onc.controller.InfrastructureJoinController');
    t.requireOk('Onc.controller.LoginController');
    t.requireOk('Onc.controller.MainController');
    t.requireOk('Onc.controller.NewVmController');
    t.requireOk('Onc.controller.NotificationBarController');
    t.requireOk('Onc.controller.SearchController');
    t.requireOk('Onc.controller.TasksController');
    t.requireOk('Onc.controller.ZabbixRegistrationController');

    t.requireOk('Onc.model.ActionsContainer');
    t.requireOk('Onc.model.Base');
    t.requireOk('Onc.model.Command');
    t.requireOk('Onc.model.Compute');
    t.requireOk('Onc.model.Hangar');
    t.requireOk('Onc.model.IpRoute');
    t.requireOk('Onc.model.ManagedNode');
    t.requireOk('Onc.model.NetworkInterface');
    t.requireOk('Onc.model.NetworkInterfaces');
    t.requireOk('Onc.model.SearchResult');
    t.requireOk('Onc.model.Storage');
    t.requireOk('Onc.model.Task');
    t.requireOk('Onc.model.Template');
    t.requireOk('Onc.model.Templates');
    t.requireOk('Onc.model.VirtualizationContainer');
    t.requireOk('Onc.model.ZabbixHostgroup');

    t.requireOk('Onc.store.ComputesStore');
    t.requireOk('Onc.store.IncomingNodesStore');
    t.requireOk('Onc.store.PhysicalComputesStore');
    t.requireOk('Onc.store.RegisteredNodesStore');
    t.requireOk('Onc.store.SearchResultsStore');
    t.requireOk('Onc.store.TasksStore');
    t.requireOk('Onc.store.TemplatesStore');
    t.requireOk('Onc.store.ZabbixHostgroupsStore');

    t.requireOk('Onc.view.InfrastructureJoinView');
    t.requireOk('Onc.view.LoginWindow');
    t.requireOk('Onc.view.NotificationBarView');
    t.requireOk('Onc.view.SearchFilterView');
    t.requireOk('Onc.view.SearchResultsView');
    t.requireOk('Onc.view.TasksView');
    t.requireOk('Onc.view.Viewport');

    t.requireOk('Onc.view.tabs.Tab');
    t.requireOk('Onc.view.tabs.VmListTab');
    t.requireOk('Onc.view.tabs.SystemTab');
    t.requireOk('Onc.view.tabs.NetworkTab');
    t.requireOk('Onc.view.tabs.StorageTab');
    t.requireOk('Onc.view.tabs.TemplatesTab');
    t.requireOk('Onc.view.tabs.ShellTab');
    t.requireOk('Onc.view.tabs.VncTab');

    t.requireOk('Onc.view.compute.ComputeHeaderView');
    t.requireOk('Onc.view.compute.ComputeStateControl');
    t.requireOk('Onc.view.compute.ComputeView');
    t.requireOk('Onc.view.compute.EditVmView');
    t.requireOk('Onc.view.compute.NewVmView');
    t.requireOk('Onc.view.compute.ZabbixRegistrationView');
});
