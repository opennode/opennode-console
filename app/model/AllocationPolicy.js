Ext.define('Onc.model.AllocationPolicy', {
    extend: 'Onc.model.Base',

    fields: [{
        name: 'id',
        type: 'string',
        persist: false
    }, {
        name: 'url',
        type: 'string',
        persist: false
    }, {
        name: 'hostname',
        type: 'string'
    }, ],

    getChild: function(name) {
        return this.children().findRecord('id', name);
    },

    getList: function(name) {
        var child = this.getChild(name);
        return child ? child.children() : null;
    },

    associations: [{
        type: 'polymorphic',
        model: 'Onc.model.Base',
        name: 'children',
        getTypeDiscriminator: function(node) {
            return 'Onc.model.' + node['__type__'];
        }
    }],

    updateSubset: function(subset, onComplete) {
        var url = this.get('url') + subset;
        console.log("Getting compute sublist data: " + subset);
        Ext.Ajax.request({
            url: Onc.core.Backend.url(url),
            method: 'GET',
            withCredentials: true,
            params: {
                depth: 3
            },
            success: function(resp) {
                console.log("Got compute sublist data: " + subset);
                var jsonData = Ext.JSON.decode(resp.responseText);
                var subList = this.getList(subset);
                if (subList) subList.removeAll(); // Remove old data

                // Create temp proxy, to load all accociations correctly
                var store = Ext.create('Ext.data.Store', {
                    autoLoad: true,
                    model: 'Onc.model.Compute',
                    data: [{
                        'children': jsonData
                    }],
                    proxy: {
                        type: 'memory',
                        reader: {
                            type: 'json'
                        }
                    }
                });
                var compTemp = store.first();
                subListTemp = compTemp.getList(subset);
                if (subListTemp) {
                    if (subList)
                        Ext.each(subListTemp.getRange(), function(it, i) {
                            subList.add(it);
                        })
                    else
                        subList = subListTemp;
                }
                onComplete(subList);
            }.bind(this),
            failure: function(request, response) {
                console.log("Cannot get Compute subset data:" + subset);
            }
        });
    },
});
