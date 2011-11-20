Ext.define('opennodeconsole.view.SearchResultsView', {
    extend: 'Ext.view.View',
    alias: 'widget.searchresults',

    store: 'ComputesStore',
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
    itemId: 'search-results',
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

    applyFilter: function(keywords) {
        var store = this.getStore();
        store.getProxy().extraParams['q'] = keywords;
        store.load();
    }
});
