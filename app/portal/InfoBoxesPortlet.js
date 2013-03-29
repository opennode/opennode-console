Ext.define('Onc.portal.InfoBoxesPortlet', {

    extend: 'Ext.panel.Panel',
    alias: 'widget.infoboxesportlet',

    border: false,
    margin: '10 0 10 0',

    _loadRunningServices: function() {
        var resourceContainer = this.up('#infoboxesportlet');
        var me = this;
        var physServersBox = this.down("#physServersBox");
        var virtualMachinesBox = this.down("#virtualMachinesBox");
        var assignedRamBox = this.down("#assignedRamBox");
        var assignedHddBox = this.down("#assignedHddBox");
        resourceContainer.setLoading(true);

        Onc.core.Backend.request('GET', 'machines/?depth=3&attrs=diskspace,memory,__type__').success(function(response) {

            var physServers = 0;
            var physCloudServers = 0;
            var physHACloudServers = 0;
            var subnets = 0;
            var virtMachines = [];
            var assignedRam = 0;
            var assignedHDD = 0;

            for ( var i = 0; i < response.children.length; i++) {
                var serv = response.children[i];
                if (serv.__type__ == 'Compute') {
                    physServers++;
                    physCloudServers++;
                    assignedHDD += serv.diskspace.total;
                    assignedRam += parseInt(serv.memory, 10);
                    for ( var j = 0; j < serv.children.length; j++) {
                        var child = serv.children[j];
                        if (child.__type__ == 'VirtualizationContainer') {
                            Ext.each(child.children, function(it, index) {
                                virtMachines.push(it.id);
                            });
                        }
                    }
                }
            }
            virtMachines = Ext.Array.unique(virtMachines);

            physServersBox.updateData({
                value: physServers,
                sub1_value: physCloudServers,
                sub2_value: physHACloudServers
            });
            virtualMachinesBox.updateData({
                value: virtMachines.length
            });
            assignedRamBox.updateData({
                value: assignedRam
            });
            assignedHddBox.updateData({
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
        this.defaults = {
            style: 'position: relative !important; float: left;',
        };
        this.items = [{
            xtype: 'infobox',
            id: 'physServersBox',
            title: 'Physical Servers',
            sub1_title: 'cloud',
            sub2_title: 'HA cloud'
        }, {
            xtype: 'infobox',
            id: 'virtualMachinesBox',
            title: 'Virtual machines'
        }, {
            xtype: 'infobox',
            id: 'assignedRamBox',
            title: 'Assigned RAM',
            convert: function(v) { return v / 1024; },
            display: ['fixed', 1],
            unit:'GB'
        }, {
            xtype: 'infobox',
            id: 'assignedHddBox',
            title: 'Assigned HDD',
            convert: function(v) { return v / 1024; },
            display: ['fixed', 1],
            unit:'GB'
        }];

        this.callParent(arguments);
    }

});
