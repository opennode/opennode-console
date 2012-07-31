Ext.define('Onc.core.hub.Subscription', {
    constructor: function(subscriber, resources) {
        this.subscriber = subscriber;
        this.resources = resources;
        this.subscribed = true;

        return this;
    },

    unsubscribe: function() {
        // unsubscription with 'resources' works only when resources is an array not an object (ON-410)
        if(this.resources.constructor == Array)
            Onc.core.hub.Hub.unsubscribe(this.subscriber, this.resources);
        else
            Onc.core.hub.Hub.unsubscribe(this.subscriber);

        this.subscribed = false;
    }
});
