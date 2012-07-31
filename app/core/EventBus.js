Ext.define('Onc.core.EventBus', {
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
    fireBusEvent: function() {
        var args = arguments;
        timerId = setTimeout(function() {
            Onc.core.EventBus.fireEvent.apply(Onc.core.EventBus, args);
        }, 0);
    },

    registerBusListeners: function(listeners) {
        if(listeners !== undefined){
            Ext.Object.each(listeners, function(ev, listener) {
                Onc.core.EventBus.addListener(ev, listener, this);
            }.bind(this));
        };
    },
});
