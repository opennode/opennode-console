Ext.define('Onc.model.Base', {
    extend: 'Ext.data.Model',

    toString: function() {
        return "<{0} {1}{2}>".format(
            this.$className,
            this.getId(),
            this.getRepr ? (":" + this.getRepr()) : ""
        );
    }
});
