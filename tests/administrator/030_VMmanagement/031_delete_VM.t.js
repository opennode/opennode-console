StartTest(function (t) {
	var rowsBefore = 0;
	var rowsAfter = 0;
	
	t.diag("Use Case: Delete new VM");
	
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
								var lastRow = document.querySelector('.x-grid-table').getElementsByTagName("tr").length;
								t.diag("3 step: Delete new created VM");
								t.type('tr:nth-child('+ lastRow +') td:nth-child(5) button[data-qtip="Delete machine"]','[ENTER]',next);
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