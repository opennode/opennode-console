Ext.override(Ext.Base, {
	toString: function() {
        return '<{0}>'.format(this.$className);
    },

    cls: function() { return this.$className.split('.').pop(); }
}); 