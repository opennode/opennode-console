Ext.define('Onc.model.Base', {
    extend: 'Ext.data.Model',
    requires: 'Onc.hub.Sync',

    _syncNotificationsEnabled: false,

    join: function(_) {
        var ret = this.callParent(arguments);
        this._maybeNotifyCreated();
        return ret;
    },

    _maybeNotifyCreated: function() {
        if (!this._syncNotificationsEnabled && this.getId() && this.store) {
            this._syncNotificationsEnabled = true;
            Onc.hub.Sync.recordCreated(this);
        }
    },

    _maybeNotifyChanges: function(changes) {
        if (!this._syncNotificationsEnabled)
            return;

        if (!this.getId() || !this.store)
            throw new Error("Sync notifications should not be enabled for records without an ID or parent store");

        var fieldNames = this.fields.keys;
        for (var key in changes) {
            if (!fieldNames.contains(key))
                delete changes[key];
        }

        if (!empty(changes))
            Onc.hub.Sync.recordModified(this, changes);
    },

    endEdit: function(_) {
        var changes = this.getChanges();

        this.callParent(arguments);

        this._maybeNotifyCreated();
        this._maybeNotifyChanges(changes);
    },

    reject: function(_) {
        var original = clone(this.modified);

        this.callParent(arguments);

        this._maybeNotifyChanges(original);
    },

    set: function(name, value) {
        if (arguments.length === 1)
            this._massSetting = true;
        try {
            var ret = this.callParent(arguments);
            // If we're not mass-setting, endEdit will do the job,
            // otherwise, only notify if we're not between a beginEdit-endEdit pair.
            if (!this._massSetting && !this.editing)
                this._maybeNotifyChanges(dict(name, value));
        } finally {
            if (arguments.length === 1)
                this._massSetting = false;
        }
        return ret;
    },

    destroy: function() {
        this.callParent(arguments);
        Onc.hub.Sync.recordDestroyed(this);
    },

    toString: function() {
        return "<{0} {1}{2}>".format(
            this.cls(),
            this.getId(),
            this.getRepr ? (":" + this.getRepr()) : ""
        );
    }
});
