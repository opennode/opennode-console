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
			    	    		defaults: {
			    	                xtype: 'box',
			    	                padding: 5
			    	            },
			    	    		items:[{ html: '# physical servers'},
			    	    		       { html: '# cloud servers'},
			    	    		       { html: '# HA cloud servers'},
			    	    		       { html: '# subnets'},
			    	    		       { html: '# Virtual machines'},
			    	    		       { html: '# of assigned RAM'},
			    	    		       { html: '# of assigned disk space'}
			    	    		]
		    	            },{
			    	    		title: 'Pending actions',
			    	    		defaults: {
			    	                 xtype: 'box',
			    	                 padding: 5
			    	            },
			    	            items:[{html: '<p>PLACEHOLDER</p>'}]
			    	    		
		    	            },{
			    	    		title: 'Running tasks',
			    	    		defaults: {
			    	                 xtype: 'box',
			    	                 padding: 5
			    	    		},
			    	    		items:[{html: '<p>PLACEHOLDER</p>'}]
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
					    		defaults: {
			    	                 xtype: 'box',
			    	                 padding: 5
			    	             },
			    	             items: [{html: '<p>PLACEHOLDER</p>' }]
			    	        }]
			            }
		            ]
               }
    	 ];
    	
        this.callParent(arguments);
    }
});
