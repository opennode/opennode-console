Ext.define('Onc.view.tabs.DashboardTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computedashboardtab',

    layout:  {type: 'hbox', align: 'stretch', pack: 'start'},
    bodyPadding: 0,

    initComponent: function() {
    	 this.items = [
	            {
	            	xtype: 'container',
	            	layout: {type: 'vbox', align: 'stretch',pack: 'start'},
	            	height: '100%',
	    	        items: [{
	                	xtype: 'panel',
	    	    		title: 'Dash1',
	    	    		height: '33%',
	    	    		width: '70%'
    	            },{
	                	xtype: 'panel',
	    	    		title: 'Dash2',
	    	    		height: '33%',
	    	    		width: '70%'
    	            },{
	                	xtype: 'panel',
	    	    		title: 'Dash3',
	    	    		height: '33%',
	    	    		width: '70%'
    	            }]
	            },
	            {
	            	xtype: 'panel',
		    		title: 'Dash4',
		    		height: '100%',
		    		width: '30%'
	            }
	    
    	              
    	 ];
    	
        this.callParent(arguments);
    }
});
