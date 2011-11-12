Ext.define('opennodeconsole.polymorphic.Association', {
    extend: 'Ext.data.HasManyAssociation',
    alias : 'association.polymorphic',

    constructor: function(config) {
        this.reader = {
            type: 'polymorphic',
            modelPrefix: config.modelPrefix,
            getTypeDiscriminator: config.getTypeDiscriminator
        };
        this.callParent(arguments);
    }
});
