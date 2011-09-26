Ext.define('opennodeconsole.view.compute.List', {
    extend: 'Ext.view.View',
    alias: 'widget.computelist',

    store: 'Computes',
    tpl: [
        '<tpl for=".">',
        '    <div class="compute state-{state}">',
        '        <div class="state-icon"></div>',
        '        <div class="descr">',
        '            <div class="hostname">{hostname}</div>',
        '            {ip_address} / {type}',
        '        </div>',
        '    </div>',
        '</tpl>'
    ],
    emptyText: 'No computes to display',

    id: 'compute-list',
    overItemCls: 'x-item-over',
    itemSelector: '.compute',
    bodyPadding: 5,
    autoScroll: true,

    initComponent: function() {
        this.callParent(arguments);

        this.store.on('load', function(store, records) {
            if (records.length > 0)
                this.select(0);
        }, this, {single: true});
    },

    applyFilter: function(keywords) {
        var store = this.getStore();
        store.getProxy().extraParams['q'] = keywords;
        store.load();
    }
});


Ext.define('opennodeconsole.view.compute.ListFilter', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.computelistfilter',

    events: ['changed'],

    layout: 'fit',
    items: {xtype: 'textfield', emptyText: "Filter by..."},

    initComponent: function() {
        this.callParent(arguments);
        var me = this;
        this.child('textfield').addListener('specialkey', function(sender, event) {
            if (event.getKey() == event.ENTER)
                me.fireEvent('changed', sender.getValue());
        });
    }
});
