Ext.define('Onc.core.Store', {
    extend: 'Ext.data.Store',

    loadById: function(modelId, successCb, errorCb) {
        var obj = this.getById(modelId);
        if (!obj){
            // if we don't have a Model already in Store, load and add it
            Ext.ModelManager.getModel(this.model).load(modelId, {
                        scope: this,
                        failure: function(record, operation) {
                            errorCb(operation);
                        },
                        success: function(record, operation) {
                            this.add(record);
                            successCb(record);
                        }
                    });
        } else {
            successCb(obj);
        }
    }

});
