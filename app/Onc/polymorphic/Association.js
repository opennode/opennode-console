Ext.define('Onc.polymorphic.Association', {
    extend: 'Ext.data.HasManyAssociation',
    alias : 'association.polymorphic',

    constructor: function(config) {
        this.reader = {
            type: 'polymorphic',
            getTypeDiscriminator: config.getTypeDiscriminator
        };
        this.callParent(arguments);
    }
});
