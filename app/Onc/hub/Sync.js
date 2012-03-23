var REC = 0;
var STORE = 1;

Ext.define('Onc.hub.Sync', {
    singleton: true,

    // The list of all records that have been registered with Sync
    _reg: [],

    // Cache of all records by their URL
    _byUrl: [],  // massoc

    // The record that is being synced with a record that was modified
    _doppelganger: null,

    recordCreated: function(rec) {
        console.assert(rec.getId(), "Only records with an ID work with Sync");

        if (this._doppelganger)
            console.warn("a new record was registered with Sync while syncing doppelgängers");

        this._reg.push(rec);

        var url = rec.get('url');
        if (url && this._byUrl.massoc(url).length === 0)
            Onc.hub.Hub.subscribe(this._getHubListener(), [url]);
        this._byUrl.setmassoc(url, rec);
    },

    recordModified: function(rec, changes) {
        console.assert(!rec.phantom);
        console.assert(rec instanceof Onc.model.Base);
        console.assert(rec.getId(), "Only records with an ID work with Sync");

        if (this._doppelganger) {
            if (rec === this._doppelganger)
                return;
            else
                throw new Error("An unrelated record was modified while syncing doppelgängers");
        }

        var recId = rec.getId();
        var recType = rec.$className;

        var existsInReg = false;
        var found = this._reg.filter(function(r) {
            existsInReg = existsInReg || (r !== rec);
            return r !== rec && r.getId() === recId && r.$className === recType;
        });

        if (!existsInReg)
            throw new Error("recordModified called for a non-registered record");

        found.forEach(function(doppelganger) {
            this._syncRecord(doppelganger, changes);
        }.bind(this));
    },

    recordDestroyed: function(rec) {
        this._reg.delassoc(rec);
    },

    
    _deleteSubscriptions: function(urls) {
        for (var i = 0; i < urls.length; i++) {
            Onc.hub.Hub.deleteSubscription(urls[i]);
        }
    },

    _removeRecords: function(removals) {
        for (var i = 0; i < removals.length; i++) {
        	// TODO: assumption that we only remove VMs is a strong one and won't hold for too long
            var store = Ext.getStore('ComputesStore');
            store.remove(store.findRecord('id', removals[i]));
        }
    },

    _syncRecord: function(rec, changes) {
        if (this._doppelganger)
            throw new Error("Attempt to sync a record while another one is already being synced");

        // This is the easiest way to avoid an endless recursive
        // loop; we cannot use silent=true.
        this._doppelganger = rec;

        try {
            var wasEditing = rec.editing;

            if (wasEditing)
                var unsavedChanges = clone(rec.getChanges());

            rec.set(changes);
            rec.commit();

            if (wasEditing)
                rec.set(unsavedChanges);

        } finally {
            this._doppelganger = null;
        }
    },

    _onDataFromHub: function(data) {
        for (var url in data) {
            var updates = data[url];

            var attrChanges = {}
            var removals = new Array();
            var deletions = new Array();
            for (var i = 0; i < updates.length; i += 1) {
                var update = updates[i][1];
                if (update['event'] === 'change')
                    attrChanges[update['name']] = update['value'];
                else if (update['event'] === 'remove')
                    removals.push(update['name']);
                else if (update['event'] === 'delete') {
                	deletions.push(update['url']);
               }
                else
                    console.warn("Unsupported update type %s", update['event']);
            }
            var records = this._byUrl.massoc(url);
            records.forEach(function(rec) {
                this._syncRecord(rec, attrChanges);
            }.bind(this));

            // remove records entries
            if (removals)
                this._removeRecords(removals);
            // remove deleted elements from the subscription list
            if (deletions)
                this._deleteSubscriptions(deletions);
        }
    },

    _getHubListener: function() {
        if (!this._hubListener)
            this._hubListener = this._onDataFromHub.bind(this);
        return this._hubListener;
    }
});