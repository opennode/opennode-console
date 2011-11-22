Ext.define('Onc.view.SearchResultsView', {
    extend: 'Ext.view.View',
    alias: 'widget.searchresults',

    store: 'ComputesStore',
    tpl: [
        '<tpl for=".">',
        // TODO: the content-type specific (`compute` and `state-_`)
        // CSS classes, and the contents of `.descr` should come
        // polymorphically depending on the type of the search result.
        '    <div class="search-result compute state-{state}">',
        '        <div class="state-icon"></div>',
        '        <div class="descr">',
        '            <div class="hostname">{hostname}</div>',
        '            {ipv4_address}',
        '        </div>',
        '    </div>',
        '</tpl>'
    ],
    emptyText: 'No search results to display',

    id: 'search-results',
    itemId: 'search-results',
    overItemCls: 'x-item-over',
    itemSelector: '.search-result',
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
