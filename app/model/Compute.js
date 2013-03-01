Ext.define('Onc.model.Compute', {
    extend: 'Onc.model.Base',
    fields: [
        {name: 'id', type: 'string', persist: false},
        {name: 'url', type: 'string', persist: false},
        {name: 'tags'},

        {name: 'architecture'},
        {name: 'cpu_info', type: 'string'},
        {name: 'os_release', type: 'string'},
        {name: 'kernel', type: 'string'},
        {name: 'template', type: 'string'},

        {name: 'hostname', type: 'string'},
        {name: 'ipv4_address', type: 'string', sortType: 'asIpv4'},
        {name: 'ipv6_address', type: 'string', sortType: 'asIpv6'},

        {name: 'state', type: 'string'},
        {name: 'effective_state', type: 'string', persist: false},

        {name: 'num_cores', type: 'integer'},
        {name: 'memory', type: 'float'},
        {name: 'diskspace', convert: function(value) {
            for (var key in value)
                value[key] = Math.round(value[key]);
            return value;
        }},
        {name: 'network', type: 'float'},
        {name: 'swap_size', type: 'float'},

        {name: 'cpu_usage', type: 'float', persist: false},
        {name: 'memory_usage', type: 'float', persist: false},
        {name: 'diskspace_usage', persist: false},
        {name: 'network_usage', type: 'float', persist: false},

        {name: 'uptime', type: 'string', persist: false},

        {name: 'features'}
    ],

    proxy: {
        type: 'onc',
        reader: {
            type: 'json'
        },
        extraParams: {
            'depth': 3
        },
        limitParam: null, pageParam: null, startParam: null,
        url: 'computes'
    },

    getMaxCpuLoad: function() {
        return this.get('num_cores') * 1.0;
    },

    getUptime: function() {
        if (this.get('state') === 'inactive')
            return null;

        var s = Math.round(this.get('uptime'));

        var days = Math.floor(s / 86400);
        s -= days * 86400;

        var hours = Math.floor(s / 3600);
        s -= hours * 3600;

        var mins = Math.floor(s / 60);
        s -= mins * 60;

        return '' + days + 'd ' + hours + 'h ' + mins + 'm ' + s + 's';
    },

    getChild: function(name) {
        return this.children().findRecord('id', name);
    },

    getList: function(name) {
        var child = this.getChild(name);
        return child ? child.children() : null;
    },

    associations: [
        {
            type: 'polymorphic',
            model: 'Onc.model.Base',
            name: 'children',
            getTypeDiscriminator: function(node) {
                return'Onc.model.' + node['__type__'];
            }
        }
    ],
    hasMany: [
        {
            model: 'Onc.model.IpRoute',
            name: 'routes'
        },
        {
            model: 'Onc.model.Storage',
            name: 'storages'
        }
    ],

    getRepr: function() {
        return this.get('hostname');
    },

    toString: function() {
        return '<Compute {0}>'.format(this.getRepr());
    },

    isPhysical: function() {
        var features = this.get('features');
        for(var i = 0; i < features.length; i++){
            if(features[i] === 'IVirtualCompute')
                return false;
        };
        return true;
    },

    isDeployed: function() {
        var features = this.get('features');
        return Onc.model.Compute.containsDeployedFeature(features);
    },

    loadParent: function(successCb, failureCb) {
        // we assume that physical computes don't have any parents
        if (!this.isPhysical()) {
            var computeStore = Ext.data.StoreManager.lookup('ComputesStore');
            var parentId = this.get('url').split('/')[2];
            computeStore.loadById(parentId, successCb, failureCb);
        } else {
            console.error('Loading of a parent of a physical machine is not supported.');
        }
    },
    
    updateSubset: function(subset) {
		var url = this.get('url') + subset;
		console.log("Getting compute sublist data: " + subset);
		Ext.Ajax.request({
			url : Onc.core.Backend.url(url),
			method : 'GET',
			withCredentials : true,
			params : {
				depth : 3
			},
			success : function(resp) {
				console.log("Got compute sublist data: " + subset);
				var jsonData = Ext.JSON.decode(resp.responseText);
				var subList = this.getList(subset);

				//Remove old data and add new
				subList.removeAll();
				for (var i = 0; i < jsonData.children.length; i++) {
					subList.add(jsonData.children[i]);
				}
				subList.sync();
			}.bind(this),
			failure : function(request, response) {
				console.log("Cannot get Compute subset data:" + subset);
			}
		});
	},

    statics: {
        isDeployed: function(jsonRecord) {
            return Onc.model.Compute.containsDeployedFeature(jsonRecord['features']);
        },

        containsDeployedFeature: function(features) {
            if (features)
                return Ext.Array.contains(features, 'IDeployed')
            else
                return false;
        },

        extractParentId: function(vmId) {
            return vmId.split('/')[2];
        },

        getComputeType: function(ctype) {
                if (ctype.indexOf('virt:yes') >= 0)
                    return 'vm';
                else return 'comp';
            },

        getType: function(ctype, shortver) {
                var el;
                var prefix="virt_type:";

                for (var i = 0; i < ctype.length; i++) {
                    var item=ctype[i];
                    if (item.indexOf(prefix)==0) {
                        el = item.replace(prefix,'');
                    }
                }

                if(el) {
                    if(shortver) {
                        var shortTypes = {'openvz':'OVZ', 'kvm':'KVM', 'physical':'PHY', 'opennode 6 server':'ON6',
                                          'opennode management server':'OMS'};
                        if (shortTypes[el]) {
                            return shortTypes[el];
                        } else {
                            return el.substr(0,3).toUpperCase();
                        };
                    }else{
                        return el;
                    }
                }
                return '';
            }
    }

});
