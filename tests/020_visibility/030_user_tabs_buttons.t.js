StartTest(function (t) {
	
	t.diag("Use Case: Login to onc as user and verify if defined buttons and tabs are not presented");
		
	t.chain(
   		
			function(next){
				//Login to opennode console as user:user
				t.diag("1 step: Login to onc as user:user");
				login(t, "user", "user", next);
			},
			
			function(next){

				t.diag("2 step: Verify if defined buttons and tabs are not presented");
				
				//Verify if Tasks button is not presented
				var taskButton = document.getElementById("tasks-button-btnEl"); 
				t.ok(taskButton==null,"Tasks button is not visible");
				
				//Verify if Host management button is not presented
				var hostButton = document.getElementById("infrastructurejoin-button-btnEl"); 
				t.ok(hostButton==null,"Host management button is not visible");
				
				//Verify if OMS Shell tab is not presented
				var omsShellTab = document.getElementById("tab-1033-btnEl"); 
				t.ok(omsShellTab==null,"OMS Shell tab is not visible");
				
				//Verify if VM Map tab is not presented
				var vmMapTab = document.getElementById("tab-1034-btnEl"); 
				t.ok(vmMapTab==null,"VM Map tab is not visible");

				next();
				
			},
			
			function(next){
				t.diag("3 step: Verify if required buttons are presented");
				
				//Verify if Logout button is presented
				var logoutButton = document.getElementById("logout-button-btnEl"); 
				t.ok(logoutButton!=null,"Logout button is visible");
				
				//Verify if Logout button has correct text 'Log out'
				var logoutButtonText = document.getElementById("logout-button-btnInnerEl"); 
				t.is(logoutButtonText.innerHTML, "Log out", "Logout button has correct text 'Log out'");
				
				next();
			},
						
			function(next){
				t.diag("4 step: Logout from onc");
				t.click('#logout-button');
				next();
			},
			{ 
				waitFor : 'selector',
				args : '.x-window-header-text'
			}		
			
    );

});