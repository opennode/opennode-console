Ext.define('Onc.model.SearchResult', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'url', type: 'string'},
        {name: '__type__', type: 'string'}
    ],

    getModel: function() {
        // TODO: Parse `this.raw` and determine the right model to
        // instantiate.  Also, how should we handle other stores? This
        // might be a general question.  How do stores handle partial
        // data?  I.e. how should be model the fact that a store at
        // any given time will not probably contain all its model's
        // instances.  This should be investigated further.
        return null;
    }
});
