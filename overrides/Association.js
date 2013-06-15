Ext.override(Ext.data.Association, {
	create : function(association) {
		if (!association.isAssociation) {
			if (Ext.isString(association)) {
				association = {
					type : association
				};
			}

			switch (association.type) {
				case 'belongsTo':
					return Ext.create('Ext.data.BelongsToAssociation', association);
				case 'hasMany':
					return Ext.create('Ext.data.HasManyAssociation', association);
				case 'polymorphic':
					return Ext.create('Onc.core.polymorphic.Association', association);
				default:
					//<debug>
					Ext.Error.raise('Unknown Association type: "' + association.type + '"');
				//</debug>
			}
		}
		return association;
	}
}); 