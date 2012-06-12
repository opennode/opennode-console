Ext.define('Onc.view.Viewport', {
    extend: 'Ext.container.Viewport',
    layout: 'border',
    requires: [
        'Onc.view.SearchFilterView',
        'Onc.view.SearchResultsView'
    ],

    items: [{
        region: 'north',
        id: 'header',
        html: '<img src="img/onc_logo.png" alt="OpenNode Console" width="436px" height="59px" />',
        frame: true,
        items: [{
            id: 'tasks-button',
            xtype: 'button',
            text: 'Tasks',
            style: 'position: absolute; top: 0px; right: 53px'
        }, {
            id: 'logout-button',
            xtype: 'button',
            text: 'Log out',
            style: 'position: absolute; top: 0px; right: 0px'
        }, {
            id: 'infrastructurejoin-button',
            xtype: 'button',
            text: 'Host management',
            style: 'position: absolute; top: 0px; right: 55px'
        }]
    }, {
        region: 'west',
        collapsible: true,
        layout: {type: 'vbox', align: 'stretchmax'},
        items: [
            {xtype: 'searchfilter'},
            {xtype: 'searchresults', flex: 1}
        ]
    }, {
        region: 'center',
        itemId: 'mainTabs',
        xtype: 'tabpanel',
        listeners: {
                'beforetabchange': function(tp, newTab, currentTab)  {
                    if (newTab.id.startswith('computeview')) {
                        newTab.updateTabs();
                    }
                }
        },
        preventHeader: true,
        defaults: {
            closable: true
        },
        items: [{
            title: "OMS Shell",
            iconCls: 'icon-shell',
            closable: false,
            xtype: 'shell',
            url: Onc.Backend.url('/bin/omsh/webterm')
        }].concat(!ENABLE_VMMAP ? [] : [{
            title: "VM Map",
            iconCls: 'icon-vmmap',
            closable: false,
            xtype: 'computevmmaptab'
        }])
    }]
});
