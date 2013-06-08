Ext.define('Onc.store.VmGridStore', {
    extend: 'Onc.core.Store',
    model: 'Onc.model.Compute',
    pageSize: 10,
    proxy: {
        type: 'onc',
        reader: {
            type: 'json',
            root: 'children',
            totalProperty: 'totalChildren'
        },
        extraParams: {
            'depth': 1,
            'attrs': 'id,url,tags,architecture,cpu_info,os_release,kernel,template,' 
                   + 'hostname,ipv4_address,ipv6_address,state,effective_state,num_cores,' 
                   + 'memory,diskspace,network,swap_size,suspicious,features',
        },
        limitParam: 'limit',
        pageParam: 'offset',
        startParam: null,
        url: 'computes'
    },
    // This does not work on filtered grid
    // filters: [{
    // property: 'id',
    // value: /[^openvz]/
    // }],
    // 
    
    
	removeAllRecords: function() {
		var toRemove = this.getTotalCount();
		if (toRemove > 0)
			this.remove(this.getRange());
	},

       
    listeners: {
    	beforeload: function( store, operation, eOpts ){
    		this.removeAllRecords();
    	},
		remove: function( store, record, index, isMove, eOpts ) {
			var id = record.get("id"); 
		
			var items = Ext.ComponentQuery.query('component[computeIdForDestroying=' + id + ']').forEach(function(c) {
                c.destroy();
            });
		},

        load: function(store, records, successful, eOpts) {
            // remove manually unwanted record, filtering does not work on filtered grid
            store.remove(store.findRecord("id", "openvz"));
        }
    },
});
