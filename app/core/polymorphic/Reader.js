Ext.define('Onc.core.polymorphic.Reader', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.polymorphic',


    extractData : function(root) {
        var me = this,
            records = [],
            Model   = me.model,
            length  = root.length,
            convertedValues, node, record, i, modelCls;

        if (!root.length && Ext.isObject(root)) {
            root = [root];
            length = 1;
        }

        for (i = 0; i < length; i++) {
            node = root[i];
            if (!node.isModel) {

                if ('__type__' in node || me.getTypeDiscriminator) {
                    var typeDiscriminator = (me.getTypeDiscriminator
                                             ? me.getTypeDiscriminator(node)
                                             : node['__type__']);
                    if (typeDiscriminator) {
                        if (!Ext.isString(typeDiscriminator)) {
                            Ext.Error.raise("Type discriminator must be a string.")
                        }
                        modelCls = Ext.ClassManager.get(typeDiscriminator);
                    }
                }

                if (!modelCls || !(modelCls.prototype instanceof me.model
                                   || modelCls == me.model))
                {
                    continue;
                }

                // TODO remove
                    // Old way:

                    // XXX: hack, but unavoidable if we want polymorphic associations:
                    // (Sencha people just can't write flexible code it seems...)

                    // extractValues uses this.model so we need to temporarily
                    // override that. Ext.data.reader.Reader class expect the
                    // model class to be defined only once at the beginning,
                    // so we have to override `this.model`, and rebuild the
                    // field extractors in order to ensure extractValues()
                    // extracts the right data fields:

                    // var tmp = me.model;
                    // me.model = modelCls;
                    // me.buildExtractors(true);
                    // values = me.extractValues(node);
                    // me.model = tmp;
                    // record = modelCls.create(values, id, node);


                // Create a record with an empty data object.
                // Populate that data object by extracting and converting field values from raw data
                record = modelCls.create(undefined, me.getId(node), node, convertedValues = {});

                // If the server did not include an id in the response data, the Model constructor will mark the record as phantom.
                // We  need to set phantom to false here because records created from a server response using a reader by definition are not phantom records.
                record.phantom = false;

                // Use generated function to extract all fields at once

                me.convertRecordData(convertedValues, node, record);

                records.push(record);

                if (me.implicitIncludes) {
                    me.readAssociated(record, node);
                }
            } else {
                // If we're given a model instance in the data, just push it on
                // without doing any conversion
                records.push(node);
            }
        }

        return records;
    },

});
