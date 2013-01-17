Ext.define('Onc.view.tabs.DashboardTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computedashboardtab',

  
    autoScroll: true,
    
    bodyPadding: 0,

    initComponent: function() {
    	 this.items = [
	            {
	            	xtype: 'container',
	            	layout: {type: 'vbox', align: 'stretch',pack: 'start'},
	            	defaults: {
	            		xtype: 'fieldset',
	            	    margin: '5 5 5 10'
	            	},
	    	        items: [{
	    	    		title: 'Dash1',
	    	    		html: '<p>World!</p>'
    	            },{
    	            	xtype: 'splitter' 
    	            },{
	    	    		title: 'Dash2',
	    	    		html: '<p>World!</p>'
    	            },{
    	            	xtype: 'splitter' 
    	            },{
	    	    		title: 'Dash3',
	    	    		html: '<p>World!</p>'
    	            }]
	            },
	            {
	            	xtype: 'container',
	            	layout: {type: 'vbox', align: 'stretch',pack: 'start'},
	            	defaults: {
	            		xtype: 'fieldset',
	            	    margin: '5 5 5 10'
	            	},
	    	        items: [{
			    		title: 'Dash4',
			    		html: '<p>World!</p>'
	    	        }]
	            }
	    
    	              
    	 ];
    	
        this.callParent(arguments);
    }
});
