var REC = 0;
var STORE = 1;

Ext.define('Onc.hub.Sync', {
    statics: {
        // The list of all records that have been registered with Sync
        _reg: [],

        // The record that is being synced with a record that was modified
        _doppelganger: null,

        recordCreated: function(rec) {
            console.assert(rec.getId(), "Only records with an ID work with Sync");

            if (this._doppelganger)
                console.warn("a new record was registered with Sync while syncing doppelgängers");

            this._reg.push(rec);
        },

        recordModified: function(rec, changes) {
            console.assert(!rec.phantom);
            console.assert(rec instanceof Onc.model.Base);

            if (this._doppelganger) {
                if (rec === this._doppelganger)
                    return;
                else
                    console.warn("an unrelated record was modified while syncing doppelgängers");
            }
            console.assert(rec.getId(), "Only records with an ID work with Sync");

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
                // console.debug("syncing doppelgänger %s of %s", ''+doppelganger, ''+rec);
                // This is the easiest way to avoid an endless recursive loop;
                // we cannot use silent=true.
                console.assert(!this._doppelganger)
                this._doppelganger = doppelganger;
                try {
                    doppelganger.set(changes);
                } finally {
                    this._doppelganger = null;
                }
            }.bind(this));
        },

        recordDestroyed: function(rec) {
            this._reg.delassoc(rec);
        }
    }
});