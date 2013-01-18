StartTest(function (t) {
	
	t.diag("Use Case: Login to onc as admin and verify if required buttons and tabs are presented");
		
	t.chain(
   		
			function(next){
				//Login to opennode console as admin:admin
				t.diag("1 step: Login to onc as admin:admin");
				login(t, "admin", "admin", next);
			},
			
			function(next){

				t.diag("2 step: Verify if required buttons and tabs are presented");
				//Verify if Tasks button is presented
				var taskButton = document.getElementById("tasks-button-btnEl"); 
				t.ok(taskButton!=null,"Tasks button is visible");
				
				//Verify if Tasks button has correct text 'Tasks'
				var taskButtonText = document.getElementById("tasks-button-btnInnerEl"); 
				t.is(taskButtonText.innerHTML, "Tasks", "Tasks button has correct text 'Tasks'");
				
				//Verify if Host management button is presented
				var hostButton = document.getElementById("infrastructurejoin-button-btnEl"); 
				t.ok(hostButton!=null,"Host management button is visible");
				
				//Verify if Host management button has correct text 'Host management'
				var hostButtonText = document.getElementById("infrastructurejoin-button-btnInnerEl"); 
				t.is(hostButtonText.innerHTML, "Host management", "Host management button has correct text 'Host management'");
				
				//Verify if Logout button is presented
				var logoutButton = document.getElementById("logout-button-btnEl"); 
				t.ok(logoutButton!=null,"Logout button is visible");
				
				//Verify if Logout button has correct text 'Log out'
				var logoutButtonText = document.getElementById("logout-button-btnInnerEl"); 
				t.is(logoutButtonText.innerHTML, "Log out", "Logout button has correct text 'Log out'");
				
				//Verify if OMS Shell tab is presented
				var omsShellTab = document.getElementById("tab-1033-btnEl"); 
				t.ok(omsShellTab!=null,"OMS Shell tab is visible");
				
				//Verify if OMS Shell tab has correct text 'OMS Shell'
				var omsShellTabText = document.getElementById("tab-1033-btnInnerEl"); 
				t.is(omsShellTabText.innerHTML, "OMS Shell", "OMS Shell tab has correct text 'OMS Shell'");
				
				//Verify if VM Map tab is presented
				var vmMapTab = document.getElementById("tab-1034-btnEl"); 
				t.ok(vmMapTab!=null,"VM Map tab is visible");
				
				//Verify if VM Map tab has correct text 'VM Map'
				var vmMapTabText = document.getElementById("tab-1034-btnInnerEl"); 
				t.is(vmMapTabText.innerHTML, "VM Map", "VM Map tab has correct text 'VM Map'");

				next();
				
			},
			
			function(next){
				t.diag("3 step: Logout from onc");
				t.click('#logout-button');
				next();
			},
			{ 
				waitFor : 'selector',
				args : '.x-window-header-text'
			}		
    
    );

});