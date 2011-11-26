Ext.define('Onc.hub.Hub', {
    statics: {
        POLL_INTERVAL: 2000,
        URL: 'stream',
        METHOD: 'POST',

        _subscriptions: {},
        _allSubscribers: [],  // assoc

        /**
         *  Subscribes the given objects to the specified resources.
         *
         *  Resources can either be an array of URLs, or a mapping of
         *  name => URL. If a mapping is provided, the subscriber will
         *  be fed a dictionary of values where keys are names not
         *  URLs.
         *
         *  @param {Array|Object} resources The list or dict of resources.
         *  @param {Function} subscriber The function to pass incoming data to.
         */
        subscribe: function(resources, subscriber, _remove) {
            if (!(subscriber instanceof Function))
                throw new Error("Subscriber must be callable");

            if (!_remove && !(resources instanceof Array))
                this._registerMapping(subscriber, resources);

            var me = this;
            function _handleUrl(url) {
                var subscribers = me._subscriptions[url];
                if (!subscribers) subscribers = me._subscriptions[url] = [];

                var ix = subscribers.indexOf(subscriber);
                if (ix === -1 && !_remove ||
                    _remove && ix !== -1)
                {
                    if (!_remove) subscribers.push(subscriber);
                    else Ext.Array.remove(subscribers, subscriber);
                }
            }

            if (resources instanceof Array)
                Ext.Array.forEach(resources, _handleUrl);
            else
                Ext.Object.each(resources, function(_, resUrl) { _handleUrl(resUrl); });
        },

        /**
         * Inverse of subscribe.
         *
         * @param {Array|Object} resources Same as with `subscribe`
         * @param {Function} subscriber The function instance that was used to create the subscription.
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
                        var subscriber = reply[0];
                        var replyData = reply[1]
                        replyData = this._mapReply(subscriber, replyData);
                        subscriber(replyData);
                    }.bind(this));
                },
                failure: function(response) {
                    console.error("Failed to poll %s", this.URL);
                },
                scope: this
            });
        },

        _registerMapping: function(subscriber, resources) {
            var mapping = this._allSubscribers.assoc(subscriber);
            if (!mapping)
                mapping = this._allSubscribers.setassoc(subscriber, {});
            Ext.Object.each(resources, function(name, url) {
                if (url in mapping)
                    throw new Error("URL already in subscriber resource mapping");
                mapping[url] = name;
            });
        },

        _mapReply: function(subscriber, replyData) {
            var mapping = this._allSubscribers.assoc(subscriber);
            if (!mapping) return replyData;

            var ret = {};
            Ext.Object.each(replyData, function(url, value) {
                var name = (url in mapping) ? mapping[url] : url;
                ret[name] = value;
            });
            return ret;
        }
    }
});
