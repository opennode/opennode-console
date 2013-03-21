Ext.define('Onc.view.compute.ComputeView', {
    extend: 'Ext.Container',
    alias: 'widget.computeview',
    requires: [
        'Onc.view.compute.ComputeHeaderView'
    ],

    iconCls: 'icon-system',
    layout: { type: 'vbox', align: 'stretch' },
//    style: 'height: auto;',

    _makeTab: function(title, type) {
        var tab = {
                title: title,
                xtype: 'compute{0}tab'.format(type),
                itemId: '{0}tab'.format(type)
            };
        if (type === 'shell') {
            tab['shellConfig'] = {
                    url: Onc.core.Backend.url(Ext.String.format('/computes/{0}/consoles/default/webterm', this.record.get('id')))
            };
        }
        if (type === 'vnc') {
            tab['vncConfig'] = {
                    url: Onc.core.Backend.url(Ext.String.format('/computes/{0}/consoles/vnc', this.record.get('id')))
            };
        }
        return tab;
    },

    _adjustTab: function(title, tabType, shouldAdd) {
        var tabs = this.down('#tabs');
        var tab = tabs.down('#{0}tab'.format(tabType));

        if (!tab && shouldAdd) {
            tabs.add(this._makeTab(title, tabType));

            // a special case for convenience
            if (tabType === 'vmlist') {
                tabs.setActiveTab(tabs.child('#vmlisttab'));
            }
        }
        if (tab && !shouldAdd) {
            tabs.remove(tab);
        }
    },

    updateTabs: function() {
        var me = this;
        var rec = this.record;
        me._adjustTab('System', 'system', true);

        var isHn = rec.getChild('vms');
        me._adjustTab('VMs', 'vmlist', isHn);
        me._adjustTab('Network', 'network', isHn);
        me._adjustTab('Templates', 'templates', isHn);

        var isActive = rec.data['state'] === 'active';
        me._adjustTab('Shell', 'shell', isActive);
        me._adjustTab('VNC', 'vnc', isActive && ENABLE_VNC);
        return true;
    },

    listeners: {
        'boxready': function(){
            Onc.core.EventBus.fireEvent("computeSuspiciousChanged", this.record.data['id'], this.record.data['suspicious']);
        }
    },

    initComponent: function() {
        var rec = this.record;

        this.title = rec.get('hostname');
        this.tabConfig = {
            tooltip: (rec.get('hostname') + '<br/>' +
                      rec.get('ipv4_address') + '<br/>' +
                      rec.get('type'))
        };
        this.items = [{
            xtype: 'computeheader',
            record: rec
//            style: 'height: auto; '
        }, {
            flex: 1,
            xtype: 'tabpanel',
            itemId: 'tabs',
            defaults: {
                record: rec//,
//                layout: {type: 'vbox', align: 'stretch' }

//                style: 'height: 100%; '
            },
//            style: 'height: 100%; ',
            items: [],
            plain: true,
            bodyStyle: 'background: inherit;'
        }];

        this.callParent(arguments);
    }
});
