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
				// Count table rows 
				rowsBefore = countRows('#gridview-1091');
				t.diag('VM list has ' + rowsBefore + ' VMs.');
				next();
			},
			
			function(next){
				// Press New VM button
				t.diag("3 step: Press New button");
				clickEl(t,"#button-1093-btnEl", next);
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
			
//			// Workround to select updated VMs table
//			function(next){
//				// Select System tab
//				t.diag("7 step: Select System tab");
//				clickEl(t,"#tab-1079-btnEl", next);
//			},
//			
//			// Workround to select updated VMs table
//			function(next){
//				// Select VMs tab
//				t.diag("8 step: Select VMs tab again");
//				clickEl(t,"#tab-1097-btnEl", next);
//			},
			
			function(next){
				var lastRow = rowsBefore;
				lastRow = lastRow + 1;
				// Wait while last table row will appear
				waitForEl(t, 'tr:nth-child('+ lastRow +') td:nth-child(2):contains("oms.autotest")');
				//waitForEl(t, '.x-grid-table');
				next();
			},

			function(next){

				var rowsAfter = countRows('#gridview-1091');
				t.diag('VM list now has ' + rowsAfter + ' before had ' + rowsBefore + ' VMs.');
				
//				var newRow = rowsAfter - rowsBefore;
//				t.is(newRow,"1","New VM is created");
//				
//				var name = document.querySelector('div[id=gridview-1091]>table>tbody>tr:nth-child(' + rowsAfter + ')>td:nth-child(2)>div').innerHTML;
//				t.is(name,"oms.autotest","New VM hostname match new created one 'oms.autotest'");
				next();
			}
			
//			function(next){
//				t.click('tr:nth-child('+ rowsAfter +') td:nth-child(5) button[data-qtip="Delete machine"]');
//				t.click('span:contains("Yes")',next);
//			}
			
//			function(){
//				t.diag("8 step: Delete VM");
//			}
			
			
    );
	 
	t.done;

});