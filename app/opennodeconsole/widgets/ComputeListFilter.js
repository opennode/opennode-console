Ext.define('opennodeconsole.widgets.ComputeListFilter', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.computelistfilter',

    events: ['changed'],

    layout: 'fit',
    items: {
        xtype: 'textfield',
        emptyText: "Filter by...",
        enableKeyEvents: true
    },

    initComponent: function() {
        this.callParent(arguments);
        var me = this;
        this.child('textfield').addListener('specialkey', function(sender, event) {
            if (event.getKey() == event.ENTER)
                me.fireEvent('changed', sender.getValue());
        });

        var previousValue = '';

        this.child('textfield').addListener({
            'keyup': function(sender, event) {
                var newValue = sender.getValue().trim();
                if (newValue !== previousValue) {
                    previousValue = newValue;
                    me.fireEvent('changed', sender.getValue());
                }
            },
            buffer: 300
        })
    }
});
