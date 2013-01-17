Ext.define('Onc.view.tabs.DashboardTab', {
    extend: 'Onc.view.tabs.Tab',
    alias: 'widget.computedashboardtab',

    autoScroll: true,
    bodyPadding: 0,

    initComponent: function() {
    	 this.items = [
               {
					xtype: 'container',
					layout: {type: 'hbox', align: 'stretch',pack: 'start'},
					height: 600,
	        	    defaults: {
	        	    	minWidth: 200,
	        	    	minHeight: 200
	        	    },
        	    	items: [
			            {
			            	xtype: 'container',
			            	layout: {type: 'vbox', align: 'stretch',pack: 'start'},
			            	width: '66%',
			            	
			            	defaults: {
			            		xtype: 'fieldset',
			            	    margin: '5 5 5 10',
			            	},
			    	        items: [{
			    	    		title: 'Runnig services',
			    	    		html: '<p>PLACEHOLDER</p>'
		    	            },{
			    	    		title: 'Pending actions',
			    	    		html: '<p>PLACEHOLDER</p>'
		    	            },{
			    	    		title: 'Running tasks',
			    	    		html: '<p>PLACEHOLDE</p>'
		    	            }]
			            },
			            {
			            	xtype: 'container',
			            	layout: {type: 'vbox', align: 'stretch',pack: 'start'},
			            	width: '34%',
			            	defaults: {
			            		xtype: 'fieldset',
			            	    margin: '5 5 5 10'
			            	},
			    	        items: [{
					    		title: 'Latest events',
					    		html: '<p>PLACEHOLDER</p>'
			    	        }]
			            }
		            ]
               }
    	 ];
    	
        this.callParent(arguments);
    }
});
