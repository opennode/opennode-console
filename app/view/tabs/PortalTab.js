Ext.define('Onc.view.tabs.PortalTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.portaltab',

    layout: 'border',
    initComponent: function() {
        var me = this;
        this.items = [{
            id: 'app-portal',
            xtype: 'portalpanel',
            region: 'center',

            items: [{
                id: 'col-1',
                columnWidth:0.4,
                items: [{
                    id: 'infoboxesportlet',
                    title: 'Available Resources',
                    header: false,
                    border: false,
                    tools: [{
                        xtype: 'tool',
                        type: 'refresh',
                        handler: function(e, target, header, tool) {
                            var portlet = header.ownerCt;
                            portlet.setLoading('Loading...');
                            portlet.down('infoboxesportlet')._loadRunningServices();
                        }
                    }],
                    items: Ext.create('Onc.portal.InfoBoxesPortlet'),
                    listeners: {
                        'close': Ext.bind(this.onPortletClose, this)
                    }
                }, {
                    id: 'portlet-1',
                    title: 'Running Tasks',
                    items: Ext.create('Onc.portal.TasksPortlet'),
                    listeners: {
                        'close': Ext.bind(this.onPortletClose, this)
                    }
                }]

            }, {
                id: 'col-2',
                columnWidth:0.6,
                items: [{
                    id: 'chartsPortlet',
                    title: 'Charts',
                    items: Ext.create('Onc.portal.GaugesChartPortlet'),
                    listeners: {
                        'close': Ext.bind(this.onPortletClose, this)
                    }
                }, {
                    id: 'logPortlet',
                    title: 'Latest Events',
                    tools: [{
                        xtype: 'tool',
                        type: 'refresh',
                        handler: function(e, target, header, tool) {
                            var portlet = header.ownerCt;
                            portlet.setLoading('Loading...');
                            portlet.down('logportlet')._loadLastEvents();
                        }
                    }],
                    items: Ext.create('Onc.portal.LogPortlet'),
                    listeners: {
                        'close': Ext.bind(this.onPortletClose, this)
                    }
                }]
            }]

        }];
        this.callParent(arguments);
    },
    onPortletClose: function(portlet) {
    },

});
