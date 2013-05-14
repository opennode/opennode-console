Ext.define('Onc.portal.InfoBoxesPortlet', {

    extend: 'Ext.panel.Panel',
    alias: 'widget.infoboxesportlet',

    border: false,

    _loadRunningServices: function() {
        var resourceContainer = this.up('#infoboxesportlet');
        var me = this;
        var physServersBox = this.down("#physServersBox");
        var virtualMachinesBox = this.down("#virtualMachinesBox");
        var assignedRamBox = this.down("#assignedRamBox");
        var assignedHddBox = this.down("#assignedHddBox");
        resourceContainer.setLoading(true);

        Onc.core.Backend.request('GET', 'computes/?depth=2&attrs=features,diskspace,memory,__type__,tags&exclude=openvz').success(function(response) {
            console.log(response);
            var physServers = 0;
            var physCloudServers = 0;
            var physHACloudServers = 0;
            var subnets = 0;
            var virtMachines = 0;
            var assignedRam = 0;
            var assignedHDD = 0;

            for ( var i = 0; i < response.children.length; i++) {
                var server = response.children[i];
                if (Ext.Array.contains(server.features, 'IUndeployed'))
                    continue;
                if (!Ext.Array.contains(server.features, 'IVirtualCompute')) {
                    physServers++;
                    // XXX number of servers and numbr of non-HA servers is the same at the moment
                    physCloudServers++;
                } else 
                    virtMachines++;
                if (server.diskspace != null)
                    assignedHDD += server.diskspace.total;
                // sometimes memory is not reported and is null
                if (server.memory != null)
                    assignedRam += parseInt(server.memory, 10);
            }

            if (physServersBox) physServersBox.updateData({
                value: physServers,
                sub1_value: physCloudServers,
                sub2_value: physHACloudServers
            });
            if (virtualMachinesBox) virtualMachinesBox.updateData({
                value: virtMachines
            });
            if (assignedRamBox) assignedRamBox.updateData({
                value: assignedRam
            });
            if (assignedHddBox) assignedHddBox.updateData({
                value: Math.round(assignedHDD)
            });

            resourceContainer.setLoading(false);
        }).failure(function(response) {
            console.assert(response.status === 403);
            serviceCmp.update('<b>Detecting available resources failed: ' + response.status + '</b>');
            resourceContainer.setLoading(false);
        });
    },

    listeners: {
        afterrender: function() {
            this._loadRunningServices();
        }
    },

    initComponent: function() {
        var isAdmin = Onc.model.AuthenticatedUser.isAdmin();

        var items = [];

        if (isAdmin) items.push({
            xtype: 'infobox',
            margin: '0 4 0 0',
            id: 'physServersBox',
            title: 'Physical Servers',
            sub1_title: 'cloud',
            sub2_title: 'HA cloud'
        });

        items.push({
            xtype: 'infobox',
            margin: '0 4 0 0',
            id: 'virtualMachinesBox',
            title: 'Virtual machines'
        });

        items.push({
            xtype: 'infobox',
            margin: '0 4 0 0',
            id: 'assignedRamBox',
            title: 'Assigned RAM',
            convert: function(v) {
                return v / 1024;
            },
            display: ['fixed', 1],
            unit: 'GB'
        });

        items.push({
            xtype: 'infobox',
            id: 'assignedHddBox',
            title: 'Assigned HDD',
            convert: function(v) {
                return v / 1024;
            },
            display: ['fixed', 1],
            unit: 'GB'
        });

        this.items = [{
            xtype: 'container',
            layout: {
                type: 'hbox',
                pack: 'justify'
            },
            defaults: {
                flex: 1,
            },
            items: items
        }];
        this.callParent(arguments);
    }

});
