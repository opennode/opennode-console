Ext.define('Onc.hub.Hub', {
    statics: {
        POLL_INTERVAL: 2000,
        URL: 'stream',
        METHOD: 'POST',

        _subscriptions: {},

        /**
         *  Subscribes the given objects to the specified
         *  resources. Returns the number of new subscriptions
         *  created.
         */
        subscribe: function(resources, subscriber, _remove) {
            var me = this;
            console.assert(subscriber instanceof Function);
            console.assert(Ext.Array.every(resources, function(r) { return typeof r === 'string'; }));

            var numChanged = 0;
            Ext.Array.forEach(resources, function(resource) {
                var subscribers = me._subscriptions[resource];
                if (subscribers === undefined)
                    subscribers = me._subscriptions[resource] = [];

                var ix = subscribers.indexOf(subscriber);
                if (ix === -1 && !_remove ||
                    _remove && ix !== -1)
                {
                    if (!_remove) {
                        subscribers.push(subscriber);
                    } else {
                        Ext.Array.remove(subscribers, subscriber);
                    }
                    numChanged += 1;
                }
            });
            return numChanged;
        },

        /**
         * Inverse of subscribe.
         */
        unsubscribe: function(resources, subscriber) {
            var ret = this.subscribe(resources, subscriber, true);
            for (var resource in this._subscriptions)
                if ((this._subscriptions[resource] || []).length === 0)
                    delete this._subscriptions[resource];
            return ret;
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
                    function _addReplyData(s, r, v) {
                        var found = false;
                        var d = {}; d[r] = v;
                        Ext.Array.forEach(replies, function(reply) {
                            var subscriber = reply[0];
                            var replyData = reply[1];
                            if (!found && subscriber === s) {
                                found = true;
                                replyData[r] = v;
                            }
                        });
                        if (!found) replies.push([s, d]);
                    }
                    Ext.Object.each(this._subscriptions, function(resource, subscribers) {
                        Ext.Array.forEach(subscribers, function(subscriber) {
                            _addReplyData(subscriber, resource, values[resource]);
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
