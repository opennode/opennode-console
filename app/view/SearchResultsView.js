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
        		
        		if(ctype.indexOf('virt:yes')>=0)return 'vm';
        		else return 'comp';
		        
			},
			getType: function(ctype, shortver){
				var el;
				var prefix="virt_type:";
				
				for (var i = 0; i < ctype.length; i++) {
					var item=ctype[i];
					if (item.indexOf(prefix)==0) {
						el = item.replace(prefix,'');
				
					}
				}

        		if(el){
        			if(shortver){
        				var shortTypes = {'openvz':'OVZ', 'kvm':'KVM', 'physical':'PHY', 'opennode 6 server':'ON6', 'opennode management server':'OMS'};
						if(shortTypes[el]){
							return shortTypes[el];
						}else{
							return el.substr(0,3).toUpperCase();
						};
        			}else{
        				return el;
        			}
        		}
        		return '';
		        
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
