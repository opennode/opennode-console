Ext.define('opennodeconsole.polymorphic.Reader', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.polymorphic',

    extractData: function(root) {
        var me = this,
            values  = [],
            records = [],
            i       = 0,
            length  = root.length,
            idProp  = me.getIdProperty(),
            node, id, record, modelCls;

        if (!root.length && Ext.isObject(root)) {
            root = [root];
            length = 1;
        }

        for (; i < length; i++) {
            node   = root[i];
            id     = me.getId(node);

            if ('__type__' in node || me.getTypeDiscriminator) {
                var typeDiscriminator = (me.getTypeDiscriminator
                                         ? me.getTypeDiscriminator(node)
                                         : node['__type__']);
                modelCls = Ext.ClassManager.get(typeDiscriminator);
                if (!modelCls && me.modelPrefix) {
                    typeDiscriminator = me.modelPrefix + '.' + typeDiscriminator;
                    modelCls = Ext.ClassManager.get(typeDiscriminator);
                }
            }
            if (!modelCls) {
                modelCls = me.model;
            } else {
                if (!(modelCls.prototype instanceof me.model)) {
                    throw new Error("Polymorphic contents must be of type " + me.model.$className);
                }
            }

            // XXX: hack, but unavoidable if we want polymorphic associations:
            // (Sencha people just can't write flexible code it seems...)

            // extractValues uses this.model so we need to temporarily
            // override that. Ext.data.reader.Reader class expect the
            // model class to be defined only once at the beginning,
            // so we have to override `this.model`, and rebuild the
            // field extractors in order to ensure extractValues()
            // extracts the right data fields:
            var tmp = me.model;
            me.model = modelCls;
            me.buildExtractors(true);
            values = me.extractValues(node);
            me.model = tmp;

            record = modelCls.create(values, id, node);
            records.push(record);

            if (me.implicitIncludes) {
                me.readAssociated(record, node);
            }
        }

        return records;
    }
});
