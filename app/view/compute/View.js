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
                title: 'Status',
                xtype: 'computestatustab'
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
                xtype: 'computetemplatestab'
            }, {
                title: 'Shell',
                xtype: 'computeshelltab',
                shellConfig: {
                    url: '/computes/' + rec.get('id') + '/consoles/default/webterm'
                    // url: 'terminal/test_arbitrary?user=root&host=' + rec.get('hostname')
                }
            }]
        }];

        this.callParent(arguments);
    }
});
