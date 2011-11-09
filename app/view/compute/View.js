Ext.define('opennodeconsole.view.compute.View', {
    extend: 'Ext.Container',
    alias: 'widget.computeview',

    iconCls: 'icon-mainframe',
    layout: {type: 'vbox', align: 'stretch'},

    initComponent: function() {
        var rec = this.record;

        this.title = rec.get('hostname');
        this.tabConfig = {
            tooltip: (rec.get('hostname') + '<br/>' +
                      rec.get('ipv4_address') + '<br/>' +
                      rec.get('type'))
        };

        this.items = [{
            xtype: 'computeinfo',
            record: rec
        }, {
            flex: 1,
            xtype: 'tabpanel',
            activeTab: 0,
            defaults: {record: rec},
            items: [{
                title: 'VMs',
                xtype: 'computestatustab',
                iconCls: 'icon-status'
            }, {
                title: 'System',
                xtype: 'computesystemtab',
                iconCls: 'icon-mainframe'
            }, {
                title: 'Network',
                xtype: 'computenetworktab',
                iconCls: 'icon-network'
            }, {
                title: 'Storage',
                xtype: 'computestoragetab',
                iconCls: 'icon-hd'
            }, {
                title: 'Templates',
                xtype: 'computetemplatestab',
                iconCls: 'icon-template'
            }, {
                title: 'Shell',
                xtype: 'computeshelltab',
                iconCls: 'icon-shell',
                shellConfig: {
                    url: Ext.String.format('/computes/{0}/consoles/default/webterm', rec.get('id'))
                }
            }, {
                title: 'Vnc',
                xtype: 'computevnctab',
                iconCls: 'icon-shell',
                vncConfig: {
                    url: Ext.String.format('/computes/{0}/consoles/vnc', rec.get('id'))
                }
            }]
        }];

        this.callParent(arguments);
    }
});
