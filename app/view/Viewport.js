Ext.define('Onc.view.Viewport', {
    extend: 'Ext.container.Viewport',
    layout: 'border',
    requires: [
        'Onc.view.SearchFilterView',
        'Onc.view.SearchResultsView'
    ],

    initComponent: function() {
        this.callParent(arguments);
        this.down('#username-label').update({name:Onc.model.AuthenticatedUser.username});
        this._adjustViewToGroups();
    },

    _adjustViewToGroups: function() {
        var isAdmin = Onc.model.AuthenticatedUser.isAdmin();
        var adminButtons = ['infrastructurejoin-button', 'tasks-button', 're-register-gauges','viewlog-button'];
        var adminTabs = ['vmmap'];
        // adjust controll buttons
        for (var i = 0; i < adminButtons.length; i++) {
            this.down('#' + adminButtons[i]).hidden = !isAdmin;
        }
        // adjust tabs
        var tabs = this.down('#mainTabs');
        if (!isAdmin)
            for (var i = 0; i < adminTabs.length; i++) {
                console.log(tabs);
                tabs.remove(this.down('#' + adminTabs[i]));
            }
    },

    items: [{
        region: 'north',
        id: 'header',
        html: '<img src="'+IMG_LOGO_MAIN+' " alt="OpenNode Console" width="436px" height="59px" />',
        height: 66,
        padding: 5,
        border: false,
        bodyStyle: 'background: inherit',
        items: [{
            xtype: 'container',
            border: false,
            style: 'position: absolute; top: 0px; right: 0px',
            bodyStyle: 'background: inherit',
            defaults: {
                margin: '0 0 0 2'
            },
            items: [{
                border: false,
                bodyStyle: 'background: inherit;',
                id: 'username-label',
                xtype: "container",
                tpl: ["<span class='username'>Hi, <b>{name}</b> !</span>"],
                data: {
                    name: 'N/A'
                },
                margin: '0 0 3 0',
                padding: 5,
                style: {
                    "text-align": 'right',
                    "text-transform": "capitalize"
                }
            }, {
                id: 'viewlog-button',
                xtype: 'button',
                text: 'View logs',
                ui: 'default-toolbar',
                style: {
                    textDecoration: 'underline'
                }
            }, {
                id: 'newapp-button',
                xtype: 'button',
                text: 'New Application',
                cls: 'btn-green',
                icon: 'img/icon/new_app.png'
            }, {
                id: 'tasks-button',
                xtype: 'button',
                text: 'Tasks'
            }, {
                id: 'infrastructurejoin-button',
                xtype: 'button',
                text: 'Host management'
            }, {
                id: 'oms-shell-button',
                xtype: 'button',
                text: 'OMS Shell'
            }, {
                id: 're-register-gauges',
                xtype: 'button',
                text: 'Re-register Gauges'
            },
            {
                id: 'logout-button',
                xtype: 'button',
                text: 'Log out'
            }]
        }]
    }, {
        region: 'west',
        collapsible: true,
        split: true,
        header: false,
        width: 220,
        minWidth: 220,
        maxWidth: 500,
        bodyCls: 'searchpanel',
        layout: {type: 'vbox', align: 'stretch'},
        items: [{
            xtype: 'searchfilter',
            border: false,
            margin: '3 2 2 2'
        }, {
            xtype: 'searchresults',
            flex: 1
        }]
    }, {
        region: 'center',
        itemId: 'mainTabs',
        xtype: 'tabpanel',
        border: false,
        bodyStyle: 'background: inherit',
        plain: true,
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
            title: "Dashboard",
            iconCls: 'icon-dashboard',
            closable: false,
            xtype: 'portaltab',
            itemId: 'dashboard'
        },{
            title: "VM list",
            iconCls: 'icon-list',
            closable: false,
            xtype: 'computevmlistgridtab',
            itemId: 'vmgrid'
        }].concat(!ENABLE_VMMAP ? [] : [{
            itemId: 'vmmap',
            title: "VM Map",
            iconCls: 'icon-vmmap',
            closable: false,
            xtype: 'computevmmaptab'
        }])
    },{
        region: 'south',
        xtype: 'container',
        border: false,
        height: 1,
        plain: true,
        preventHeader: true,
        bodyStyle: 'background: inherit',
        items: []
    }]
});
