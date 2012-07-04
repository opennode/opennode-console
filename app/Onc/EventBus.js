Ext.define('Onc.EventBus', {
    extend: 'Ext.util.Observable',
    singleton: true
});


Ext.app.Controller.override({
    constructor: function(config){
        var instance = this.callOverridden(arguments);

        // register listeners as defined in busListeners property
        // example:
        //  busListeners: {
        //      event1: function(...){...},
        //      event2: function(...){...}
        //  },

        this.registerBusListeners(this.busListeners);
        return instance;
    }
});


Ext.app.Controller.implement({
    fireBusEvent: function(eventName, args) {
        Onc.EventBus.fireEvent(eventName, args);
    },

    registerBusListeners: function(listeners) {
        if(listeners !== undefined){
            Ext.Object.each(listeners, function(ev, listener) {
                Onc.EventBus.addListener(ev, listener, this);
            }.bind(this));
        };
    },
});
