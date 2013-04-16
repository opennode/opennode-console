Ext.define('Onc.core.hub.Hub', {
    singleton: true,

    POLL_INTERVAL: 2000,
    URL: 'stream',
    METHOD: 'POST',

    _reg: [],  // massoc
    _mappings: [],  // assoc

    // State
    _running: false,
    _relativisticToken: +(new Date),
    
    /**
     * Called when logging out, so polling for changes would stop.
     */
    onLogout: function(){
        this._reg = [];
        this._mappings = [];
        this._running = false;
        this._poll.bind(this).schedule({
            wait: 0,
            repeat: false
        });
    },

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
     *  @param {Function} function should return true if the subscription is enabled
     */
    subscribe: function(subscriber, resources, type, isEnabled, _remove) {
        if (!(subscriber instanceof Function))
            throw new Error("Subscriber must be callable");

        var urls;

        if (resources instanceof Array) {
            urls = resources;
        } else {
            urls = Ext.Object.getValues(resources);
        }

        // TODO: for now we piggy back the enabler function on the subscriber function instead
        // we should refactor the subscription registry so that we register compound objects
        // instead of raw subscriber functions
        if (subscriber instanceof Function)
            subscriber.isEnabled = isEnabled;

        if (!_remove)
            this._registerMapping(subscriber, resources, type);

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

        return Ext.create('Onc.core.hub.Subscription', subscriber, resources);
    },

    /**
     * Inverse of subscribe.
     *
     * @param {Array|Object} resources Same as with `subscribe`
     * @param {Function} subscriber The function instance that was used to create the subscription.
     */
    unsubscribe: function(subscriber, resources) {
        this.subscribe(subscriber, resources, undefined, undefined, true);
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
        this._poll.bind(this).schedule({
            wait: this.POLL_INTERVAL,
            repeat: true
        });
    },

    deleteSubscription: function(url) {
        this._reg.delmassoc(url);
    },

    _poll: function() {
        var d = new Onc.core.util.Deferred();

        var enabledReg = this._reg.filter(function(reg) {
            var isEnabled = reg[1].isEnabled;
            if (isEnabled) {
                try {
                    var res = isEnabled();
                    return res;
                } catch (e) {
                    console.log("Error checking whether subscription is enabled", e);
                    return false;
                }
            }
            return true;
        });

        var urls = enabledReg.massocKeys();

        if (urls.length === 0) return succeed();

        var r = Onc.core.Backend.request(this.METHOD, this.URL, {
            params: {'after': this._relativisticToken || 0},
            jsonData: urls
        });

        r.success(d.trigger(function(result, response) {
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
                    console.assert(updates.length);
                    dataAsObj[url] = updates;
                });
                console.assert(!empty(dataAsObj));
                this._deliverReply(subscriber, dataAsObj);
            }.bind(this));
        }.bind(this)));

        r.failure(d.triggerErrback(function(response) {
            console.error("Failed to poll %s", this.URL);
        }.bind(this)));

        return d;
    },
    getFromPast: function(timestamp, urls, callbackFn) {
        var d = new Onc.core.util.Deferred();

        var r = Onc.core.Backend.request(this.METHOD, this.URL, {
            params: {
                'after': timestamp || 0,
                'limit': 1000
            },
            jsonData: urls
        });

        r.success(d.trigger(function(result, response) {

            var streamData = result[1];

            var replies = [];
            Ext.Object.each(streamData, function(urlIx, updates) {
                if (updates.length === 0) {
                    console.warn("Stream response violates protocol: value lists in streamData should be non-empty");
                    return;
                }
                var urlIx = parseInt(urlIx);
                replies.push([callbackFn, [urls[urlIx], updates]]);
            }.bind(this));

            replies.massocForEach(function(subscriber, data) {
                var dataAsObj = {};
                data.assocForEach(function(url, updates) {
                    console.assert(updates.length);
                    dataAsObj[url] = updates;
                });
                console.assert(!empty(dataAsObj));

                var data = {};
                Ext.Object.each(dataAsObj, function(url, updates) {
                    var name = url;
                    data[name] = updates;
                });

                subscriber(data);
            }.bind(this));
        }.bind(this)));

        r.failure(d.triggerErrback(function(response) {
            console.error("Failed to poll %s", this.URL);
        }.bind(this)));

        return d;
    },

    _registerMapping: function(subscriber, resources, type) {
        var mapping = this._mappings.assoc(subscriber);
        if (!mapping)
            mapping = this._mappings.setassoc(subscriber, {});

        function _addMapping(url, m) {
            if (url in mapping)
                throw new Error("URL '{0}' already in subscriber resource mapping".format(url));
            mapping[url] = m;
        }

        if (resources instanceof Array) {
            resources.forEach(function(url) {
                _addMapping(url, [url, type]);
            });
        } else {
            Ext.Object.each(resources, function(name, url) {
                _addMapping(url, [name, type]);
            });
        }
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
            data[name] = (type === 'gauge' ? updates[updates.length - 1][1] : updates);
        });

        subscriber(data);
    }
});
