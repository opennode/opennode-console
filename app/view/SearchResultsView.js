Ext.define('Onc.view.SearchResultsView', {
    extend: 'Ext.view.View',
    alias: 'widget.searchresults',

    store: 'SearchResultsStore',
    tpl : new Ext.XTemplate(
        '<tpl for=".">',
        // TODO: the content-type specific (`compute` and `state-_`)
        // CSS classes, and the contents of `.descr` should come
        // polymorphically depending on the type of the search result.
        '    <div class="search-result compute state-{state}">',
        '        <div class="state-color" data-qtip="State: {state}"></div>',
        '        <div class="{[this.getComputeType(values.tags)]}-icon"><span data-qtip="{[this.getType(values.tags, false)]}">{[this.getType(values.tags, true)]}</span></div>',
        '		 <div class="split-vertical"></div>',
        '        <div class="descr">',
        '            <div class="hostname">{hostname}</div>',
        '            {ipv4_address}',
        '        </div>',
        '    </div>',
        '</tpl>',
        {
            getComputeType: function(ctype){
                return Onc.model.Compute.getComputeType(ctype);
            },
            getType: function(ctype, shortver){
                return Onc.model.Compute.getType(ctype, shortver);
            }
        }
    ),
    emptyText: 'No search results to display',

    id: 'search-results',
    itemId: 'search-results',
    overItemCls: 'x-item-over',
    itemSelector: '.search-result',
    bodyPadding: 5,
    autoScroll: true,

    listeners: {
        'selectionchange': function(_, selections) {
            console.log('selection change', selections);
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
