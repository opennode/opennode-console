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
        '            {ipv4_address} | {type}',
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

    listeners: {
        'selectionchange': function(_, selections) {
            if (selections.length === 1) {
                var node = this.getNode(selections[0]);
                Ext.fly(node).scrollIntoView(this.el);
            }
        }
    },

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
