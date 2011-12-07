Ext.define('Onc.view.compute.ComputeView', {
    extend: 'Ext.Container',
    alias: 'widget.computeview',
    requires: [
        'Onc.view.compute.ComputeInfoView'
    ],

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

        var tabs = [{
            title: 'System',
            xtype: 'computesystemtab',
            iconCls: 'icon-mainframe'
        }]
        
        if (rec.getChild('vms')) {
            tabs.unshift({
            	title: 'VMs',
            	xtype: 'computestatustab',
            	iconCls: 'icon-status'
       		});
       		tabs.push({
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
	        });
        }

       	if (rec.data['state'] == 'active')
            tabs.push({
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
	        });

        this.items = [{
            xtype: 'computeinfo',
            record: rec
        }, {
            flex: 1,
            xtype: 'tabpanel',
            activeTab: 0,
            defaults: {record: rec},
            items: tabs
        }];

        this.callParent(arguments);
    }
});
