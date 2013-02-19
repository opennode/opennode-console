StartTest(function (t) {
	
	var rowsBefore = '';
	var rowsAfter = '';
	var migrateButton = '';
	var migrating = '';
	var title = '';
	var msg = '';
	var VMname = '';
	var vmid = '';
	var firstHost = '';
	var secondHost = '';
	var firstHostname = '';
	var secondHostname = '';
	
	t.diag("Use Case: Migrate selected VM");
	
	t.chain(
   		
			// Wait while login screen or main page of onc will start
			function(next){
				t.chain(
						{
							waitFor : 1000
						},
						next
				);
			},
			function(next){
				// Login to onc or verify if correct user is logged in
				var goon = verifyIfUserIsLoggedIn(t,"admin");
				if (goon == true){
					t.chain(
					   		
						{
							waitFor : 5000
						},

						// Read 2 hostnames for migration and click first hostname
						function(next){
							firstHost = Ext.get(Ext.ComponentQuery.query("#search-results")).item(0).dom.el.dom.firstElementChild;
							secondHost = Ext.get(Ext.ComponentQuery.query("#search-results")).item(0).dom.el.dom.firstElementChild.nextElementSibling;
							firstHostname = firstHost.textContent.trim().split(" ")[0];
							secondHostname = secondHost.textContent.trim().split(" ")[0];
							console.log(firstHostname);
							console.log(secondHostname);
							t.diag("Select first hostname");
							t.click(firstHost);
							next();
						},
						
						function(next){
							// Select VMs tab
							t.diag("Select VMs tab");
							clickEl(t,"span:contains('VMs')", next);
						},

						function(next){
							// Wait for table
							waitForEl(t,'.x-grid-table');
							next();
						},
						
						function(next){
							// Select name and id of VM for migration
							var lastRow = document.querySelector('.x-grid-table').getElementsByTagName("tr").length;
							if (lastRow>2){
								VMname = document.querySelector('tr:nth-child(' + lastRow + ')>td:nth-child(2)>div').innerHTML;
								vmid = document.querySelector('tr:nth-child(' + lastRow + ')>td:nth-child(8)>div').innerHTML;
								t.diag("Selected VM for migration - "+ VMname);
								console.log(VMname);
								console.log(vmid);
								t.chain (
										function(next){

											// Open VM Map
											var vmMapTabItem = Ext.get(Ext.ComponentQuery.query("#vmmap")).item(1);
											t.click(vmMapTabItem.dom.tab.el);
											t.diag('Open VM map window');
											
											// Press migrate button
											migrateButton = Ext.get(Ext.ComponentQuery.query("#migrate")).item(0);
											t.click(migrateButton.dom.el);
											t.diag('Press migrate button');

											next();
											
										},
										
										{
											waitFor : 5000
										},
										
										function(next){
											// Identify VM for migration in VMmap
											var source = Ext.get('vmmap-'+ vmid);
											console.log(source);
											var vmmap=Ext.get(Ext.ComponentQuery.query('gridview')).item(0).dom.all.elements;
											// Identify place in the VMmap table where to migrate VM
											var targetname = secondHost.textContent.trim().split(" ")[0];
											var target = null;
											for (var i = 0; i < vmmap.length; i++) {
												if (Ext.get(vmmap).item(i).dom.cells.item(0).textContent == targetname) {
													target = Ext.get(vmmap).item(i).dom.cells.item(1);
													break;
												}
												
											}
											console.log(targetname);
											console.log(target);
											t.diag(VMname +' will be migrated to '+ targetname);
										    
											// Drag and drop VM from source to target
											t.chain(
										        {
										            action      : 'drag',
										            source      : source,
										            to          : target
										        },
										        
										        // Press "Yes" in the confirmation message
										        function(next){
										        	title = Ext.get(Ext.ComponentQuery.query('#messagebox-1001')).item(0).dom.title;
										        	if (title=="Confirm"){
										        		t.click('button span:contains("Yes")');
										        		t.diag('Confirm migration');
										        	} 
										        	 next();
										        },
										        
										        // Verify if migrating in progress
										        function(next){
										        	migrating = document.querySelector('.x-mask-loading');
										        	if (migrating!=null){
										        		t.diag('Migrating ....');
										        	}
										        	next();
										        },
										        
												function(next){
													t.chain(
													    	{
													    		waitFor: 'waitForElementNotVisible',
													    		args : migrating
													    	},
													    	{
													    		waitFor: 'waitForElementVisible',
													    		args : '#messagebox-1001'
													    	},
												        
													    	// Verify if migrating progress ended successfully
															function(next){
													    		title = Ext.get(Ext.ComponentQuery.query('#messagebox-1001')).item(0).dom.title;
													    		msg = Ext.get(Ext.ComponentQuery.query('#messagebox-1001')).item(0).dom.msg.value;
																					
																if (title=='Migration succeeded'){
																	t.pass('Message title: '+ title);
																	t.pass('Message text: '+ msg);
																	t.click('button span:contains("OK")');
																} else {
																	if (title!='Migration succeeded') {
																		t.fail('Message title: '+ title);
																		t.fail('Message text: '+ msg);
																		t.click('button span:contains("OK")');
																	}
																}
																next();
															},
																				
															function(next){
																// Click Cancel migration button
															   	t.click(migrateButton.dom.el);
															   	next();
															}
															
													);
													next();
												}
										
										        
										    );
										    next();
										}
								);
							} else {
								t.diag("There is no VMs or is one VM. We don't want to migrate the last VM. Please create more VMs or run migrate_newVM test");
							}

							next();
						}
						
				       );
				}
				next();
			}

    );
	
});