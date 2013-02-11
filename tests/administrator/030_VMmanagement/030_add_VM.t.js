StartTest(function (t) {
	var rowsBefore = 0;
	var rowsAfter = 0;
	
	t.diag("Use Case: Create new VM");
	
	t.chain(
   		
			function(next){
				t.chain(
						{
							waitFor : 500
						},
						next
				);
			},
			
			function(next){
				var goon = verifyIfUserIsLoggedIn(t,"admin");
				if (goon == true){
					t.chain(
					   		
							function(next){
								clickEl(t,".descr", next);
							},
							
							function(next){
								// Select VMs tab
								t.diag("2 step: Select VMs tab");
								clickEl(t,"span:contains('VMs')", next);
							},

							function(next){
								waitForEl(t,'.x-grid-table');
								next();
							},
							
							function(next){
								// Count table rows without header
								rowsBefore = countRows('.x-grid-table');
								t.diag('VM list has ' + rowsBefore + ' VMs.');
								next();
							},
							
							function(next){
								// Press New VM button
								t.diag("3 step: Press New button");
								clickEl(t,"span:contains('New')", next);
							},
							
							function(next){
								// Expand Template input field
								clickEl(t,"#template-inputEl", next);
							},
							
							function(next){
								// Select template
								t.diag("4 step: Select template");
								t.type("#template-inputEl",'[DOWN]');
								t.type("#template-inputEl",'[ENTER]',next);
							},
							
							function(next){
								// Select hostname input field and enter new VM hostname
								t.diag("5 step: Enter New VM hostname");
								t.selectText("#hostname-inputEl");
								t.type("#hostname-inputEl","oms.autotest",next);
							},
							
							function(next){
								// Press 'Create' button
								t.diag("6 step: Press 'Create' button");
								clickEl(t,'span:contains("Create")', next);
							},
							
							function(next){
								t.chain(
										{
											waitFor : 7000
										},
										next
								);
							},
							
					
							function(next){
								// Count table rows without header
								rowsAfter =  countRows('.x-grid-table');
								t.diag('VM list now has ' + rowsAfter + ' before had ' + rowsBefore + ' VMs.');
								
								t.is(rowsAfter,rowsBefore+1,"New VM is created");
								
								var lastRow = document.querySelector('.x-grid-table').getElementsByTagName("tr").length;
								var name = document.querySelector('tr:nth-child(' + lastRow + ')>td:nth-child(2)>div').innerHTML;
								t.is(name,"oms.autotest","New VM hostname match new created one 'oms.autotest'");
								next();
							},
							
							function(next){
								var lastRow = document.querySelector('.x-grid-table').getElementsByTagName("tr").length;
								t.diag("3 step: Delete new created VM");
								var stopVM = document.querySelector('tr:nth-child('+ lastRow +') td:nth-child(5) button[data-qtip="Start machine"]');
								var nameVM = document.querySelector('tr:nth-child(' + lastRow + ')>td:nth-child(2)>div').innerHTML;
								
								//
								
								if(nameVM=="oms.autotest"){
									if(stopVM!=null){
										t.type('tr:nth-child('+ lastRow +') td:nth-child(5) button[data-qtip="Delete machine"]','[ENTER]',next);
										}
								} else
									t.diag("There is no VM with name oms.autotest or this machine is started");
							},
							
							function(next){
								t.type('span:contains("Yes")','[ENTER]',next);
							},
							
							function(next){
								t.chain(
										{
											waitFor : 7000
										},
										next
								);
							},
							
							function(next){
								// Count table rows without header
								rowsBefore = rowsAfter;
								rowsAfter =  countRows('.x-grid-table');
								t.diag('VM list now has ' + rowsAfter + ' before had ' + rowsBefore + ' VMs.');
								t.is(rowsAfter,rowsBefore-1,"VM was deleted");

								next();
							}
							
				    );

				}
				next();
			}
			

			
    );

});