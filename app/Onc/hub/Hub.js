Ext.define('Onc.hub.Hub', {
    statics: {
        POLL_INTERVAL: 2000,
        URL: 'stream',
        METHOD: 'POST',

        _subscriptions: {},

        /**
         *  Subscribes the given objects to the specified resources.
         */
        subscribe: function(resources, subscriber, _remove) {
            var me = this;
            console.assert(subscriber instanceof Function);
            console.assert(Ext.Array.every(resources, function(r) { return typeof r === 'string'; }));

            Ext.Array.forEach(resources, function(resource) {
                var subscribers = me._subscriptions[resource];
                if (subscribers === undefined)
                    subscribers = me._subscriptions[resource] = [];

                var ix = subscribers.indexOf(subscriber);
                if (ix === -1 && !_remove ||
                    _remove && ix !== -1)
                {
                    if (!_remove) subscribers.push(subscriber);
                    else Ext.Array.remove(subscribers, subscriber);
                }
            });
        },

        /**
         * Inverse of subscribe.
         */
        unsubscribe: function(resources, subscriber) {
            this.subscribe(resources, subscriber, true);
            for (var resource in this._subscriptions)
                if ((this._subscriptions[resource] || []).length === 0)
                    delete this._subscriptions[resource];
        },

        /**
         * Starts polling the server.
         *
         * No requests will be made if no resources have been
         * subscribed to.
         */
        run: function() {
            if (this._running) throw new Error("Hub already running");
            setInterval(this._poll.bind(this), this.POLL_INTERVAL);
        },

        _poll: function() {
            var allSubscribedResources = Ext.Object.getKeys(this._subscriptions);
            if (allSubscribedResources.length === 0) return;

            Ext.Ajax.request({
                method: this.METHOD, url: BACKEND_PREFIX + this.URL,
                jsonData: allSubscribedResources,
                success: function(response) {
                    var result = Ext.JSON.decode(response.responseText);
                    var values = {};
                    Ext.Array.forEach(result, function(value, i) {
                        values[allSubscribedResources[i]] = value;
                    });
                    var replies = [];
                    Ext.Object.each(this._subscriptions, function(resource, subscribers) {
                        var value = values[resource];
                        Ext.Array.forEach(subscribers, function(subscriber) {
                            var replyData = replies.assoc(subscriber);
                            if (!replyData) replyData = replies.setassoc(subscriber, {});
                            replyData[resource] = value;
                        });
                    });
                    Ext.Array.forEach(replies, function(reply) {
                        reply[0](reply[1]);
                    });
                },
                failure: function(response) {
                    console.error("Failed to poll %s", this.URL);
                },
                scope: this
            });
        }
    }
});
