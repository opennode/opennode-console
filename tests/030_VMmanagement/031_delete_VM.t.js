StartTest(function (t) {
	var rowsBefore = 0;
	var rowsAfter = 0;
	
	t.diag("Use Case: Create new VM");

	t.chain(
   		
			function(next){
				//Login to opennode console as admin:admin
				t.diag("1 step: Login to onc as admin:admin");
				login(t, "admin", "admin", next);
			},
			
			function(next){
				clickEl(t,".descr", next);
			},
			
			function(next){
				// Select VMs tab
				t.diag("2 step: Select VMs tab");
				clickEl(t,"#tab-1097-btnEl", next);
			},

			function(next){
				waitForEl(t,'.x-grid-table');
				next();
			},
			
			function(next){
				// Count table rows without header
				rowsBefore = countRows('#gridview-1091');
				t.diag('VM list has ' + rowsBefore + ' VMs.');
				next();
			},
			
			function(next){
				var lastRow = document.querySelector('#gridview-1091').getElementsByTagName("tr").length;
				t.diag("3 step: Delete new created VM");
				t.type('tr:nth-child('+ lastRow +') td:nth-child(5) button[data-qtip="Delete machine"]','[ENTER]',next);
			},
			
			function(next){
				t.type('span:contains("Yes")','[ENTER]',next);
			},
			
			
			function(next){
				clickEl(t,".descr", next);
			},
			
			function(next){
				// Select VMs tab
				t.diag("2 step: Select VMs tab");
				clickEl(t,"#tab-1097-btnEl", next);
			},

			function(next){
				waitForEl(t,'.x-grid-table');
				next();
			},
			
			function(next){
				// Count table rows without header
				rowsAfter =  countRows('#gridview-1091');
				t.diag('VM list now has ' + rowsAfter + ' before had ' + rowsBefore + ' VMs.');
//				t.is(rowsAfter-1,rowsBefore,"VM was deleted");

				next();
			}
			
    );
	 
	t.done;

});