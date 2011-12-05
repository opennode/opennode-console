Ext.define('Onc.hub.Hub', {
    statics: {
        POLL_INTERVAL: 2000,
        URL: 'stream',
        METHOD: 'POST',

        _reg: [],  // massoc
        _mappings: [],  // assoc

        // State
        _running: false,
        _relativisticToken: +(new Date),

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
         *  @param {String} type The type of the subscription, either 'gauge' or 'chart'.
         */
        subscribe: function(subscriber, resources, type, _remove) {
            if (!(subscriber instanceof Function))
                throw new Error("Subscriber must be callable");

            var urls;

            if (resources instanceof Array) {
                urls = resources;
            } else {
                urls = Ext.Object.getValues(resources);
                if (!_remove)
                    this._registerMapping(subscriber, resources, type);
            }

            if (!_remove) {
                urls.forEach(function(url) {
                    this._reg.setmassoc(url, subscriber);
                }.bind(this));
            } else {
                var newReg = this._reg.keep(function(reg) {
                    return (reg[1] === subscriber && (!resources || resources.contains(reg[0])));
                });
                console.assert(newReg.length !== this._reg.length, "Registry should shrink after unsubscription");
                this._reg = newReg;
            }
        },

        /**
         * Inverse of subscribe.
         *
         * @param {Array|Object} resources Same as with `subscribe`
         * @param {Function} subscriber The function instance that was used to create the subscription.
         */
        unsubscribe: function(subscriber, resources) {
            this.subscribe(subscriber, resources, undefined, true);
            if (!this._reg.massocValues().contains(subscriber))
                this._mappings.delassoc(subscriber);
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
            var urls = this._reg.massocKeys();
            if (urls.length === 0) return;

            Ext.Ajax.request({
                method: this.METHOD, url: BACKEND_PREFIX + this.URL,
                params: {
                    'after': this._relativisticToken || 0
                },
                jsonData: urls,

                success: function(response) {
                    var result = Ext.JSON.decode(response.responseText);
                    this._relativisticToken = result[0];
                    var streamData = result[1];

                    var replies = [];
                    Ext.Object.each(streamData, function(urlIx, updates) {
                        if (updates.length === 0) {
                            console.warn("Stream response violates protocol: value lists in streamData should be non-empty");
                            return;
                        }
                        var urlIx = parseInt(urlIx);
                        var subscribers = this._reg.massoc(urls[urlIx]);
                        subscribers.forEach(function(subscriber) {
                            replies.push([subscriber, [urls[urlIx], updates]]);
                        });
                    }.bind(this));

                    replies.massocForEach(function(subscriber, data) {
                        var dataAsObj = {};
                        data.assocForEach(function(url, updates) {
                            dataAsObj[url] = updates;
                        });
                        this._deliverReply(subscriber, dataAsObj);
                    }.bind(this));
                }.bind(this),

                failure: function(response) {
                    console.error("Failed to poll %s", this.URL);
                }.bind(this)
            });
        },

        _registerMapping: function(subscriber, resources, type) {
            var mapping = this._mappings.assoc(subscriber);
            if (!mapping)
                mapping = this._mappings.setassoc(subscriber, {});
            Ext.Object.each(resources, function(name, url) {
                if (url in mapping)
                    throw new Error("URL '{0}' already in subscriber resource mapping".format(url));
                mapping[url] = [name, type];
            });
        },

        _deliverReply: function(subscriber, replyData) {
            var mapping = this._mappings.assoc(subscriber);

            var data = {};
            Ext.Object.each(replyData, function(url, updates) {
                var m = (mapping && url in mapping ? mapping[url] : [url, 'stream']);

                var name = m[0];
                var type = m[1];

                // If the subscription type is gauge, only the last
                // value is important. Any previous values are ignored
                // and so is the timestamp of the last value:
                data[name] = (type === 'gauge' ? updates.pop()[1] : updates);
            });

            subscriber(data);
        }
    }
});
