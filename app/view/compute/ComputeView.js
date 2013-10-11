Ext.define('Onc.view.compute.ComputeView', {
    extend : 'Ext.Container',
    alias : 'widget.computeview',
    requires : ['Onc.view.compute.ComputeHeaderView'],

    iconCls : 'icon-system',
    layout : {
        type : 'vbox',
        align : 'stretch'
    },

    _makeTab : function(title, type, tab_specification) {
        var tab = {
            title : title,
            xtype : 'compute{0}tab'.format(type),
            itemId : '{0}tab-{1}'.format(type, tab_specification)
        };
        if (type === 'vmlist') {
            tab['vmlistConfig'] = {
                url : 'vms-' + tab_specification
            };
        }
        if (type === 'shell') {
            tab['shellConfig'] = {
                url : Onc.core.Backend.url(Ext.String.format('/computes/{0}/consoles/default/webterm', this.record.get('id')))
            };
        }
        if (type === 'vnc') {
            tab['vncConfig'] = {
                url : Onc.core.Backend.url(Ext.String.format('/computes/{0}/consoles/vnc', this.record.get('id')))
            };
        }
        return tab;
    },

    _adjustTab : function(title, tabType, shouldAdd, tab_specification) {
        var tabs = this.down('#tabs');
        var tab = tabs.down('#{0}tab{1}'.format(tabType, tab_specification));

        if (!tab && shouldAdd) {
            tabs.add(this._makeTab(title, tabType, tab_specification));

            // a special case for convenience
            if (tabType === 'vmlist') {
                tabs.setActiveTab(tabs.child('#vmlisttab'));
            }
        }
        if (tab && !shouldAdd) {
            tabs.remove(tab);
        }
    },

    updateTabs : function() {
        var me = this;
        var rec = this.record;
        me._adjustTab('System', 'system', true);

        var isHn = rec.getChild('vms');
        var isOpenVz = rec.getChild('vms-openvz');
        var isKVM = rec.getChild('vms-kvm');
        me._adjustTab('KVM VMs', 'vmlist', isKVM, 'kvm');
        me._adjustTab('OpenVZ VMs', 'vmlist', isOpenVz, 'openvz');
        me._adjustTab('Network', 'network', isHn);
        me._adjustTab('Templates', 'templates', isHn);

        var isActive = rec.data['state'] === 'active';
        me._adjustTab('Shell', 'shell', isActive && Ext.ENABLE_CONSOLES);
        me._adjustTab('VNC', 'vnc', isActive && Ext.ENABLE_VNC && Ext.ENABLE_CONSOLES);
        return true;
    },

    listeners : {
        'boxready' : function() {
            Onc.core.EventBus.fireEvent("computeSuspiciousChanged", this.record.data['id'], this.record.data['suspicious']);
        }
    },

    initComponent : function() {
        var rec = this.record;

        this.title = rec.get('hostname');
        this.tabConfig = {
            tooltip : (rec.get('hostname') + '<br/>' + rec.get('ipv4_address') + '<br/>' + rec.get('type'))
        };
        this.items = [{
            xtype : 'computeheader',
            record : rec
        }, {
            flex : 1,
            xtype : 'tabpanel',
            itemId : 'tabs',
            defaults : {
                record : rec//,
            },
            items : [],
            plain : true,
            bodyStyle : 'background: inherit;'
        }];

        this.callParent(arguments);
    }
});
