Ext.define('Onc.store.NodesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.ManagedNode',
	dontRefreshFields:["status"],
	staticData:[],

    listeners: {
        beforeload: function(store, options) {
        	this._staticBeforeload(store, options);
        },
        load:function(store, records, successful, eOpts ){
        	this._staticLoad(store, records, successful, eOpts )
        }
    },
    _staticBeforeload: function(store, options) {
		console.log("Saving staticData beforeload.");
    	var records=store.getRange(0, store.getCount());
    	Ext.each(records, function(rec) {
							console.log(rec);
							var dataToPush={};
							Ext.each(store.dontRefreshFields, function(f) {
								console.log(f);
								dataToPush[f]=rec.get(f);
								console.log("Saving field:"+f+", value:"+rec.get(f)+" for "+rec.getId());
							});
							store.staticData[rec.getId()]=dataToPush;
		});
		console.log(store.staticData);
    },
    _staticLoad:function(store, records, successful, eOpts ){
    	console.log("Updating records with staticData onload.");
    	Ext.each(records, function(rec) {
			var dItem=store.staticData[rec.getId()];
			if(dItem){
				console.log("Found item in static data for "+rec.getId());
				Ext.iterate(dItem, function(fKey, fValue) {
					console.log("Key:"+fKey+". Value:"+fValue);
					rec.set(fKey, fValue);
				});
			}
		});
    }
});
