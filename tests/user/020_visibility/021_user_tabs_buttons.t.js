StartTest(function (t) {
	
	t.diag("Use Case: Login to onc as user and verify if defined buttons and tabs are not presented");
	
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
				var goon = verifyIfUserIsLoggedIn(t,"user");
				if (goon == true){
					
					t.chain(
					   		
							{
								waitFor : 4000
							},
							
							function(next){

								t.diag("2 step: Verify if defined buttons and tabs are not presented");
								
								//Verify if Tasks button is not presented
								var taskButton = Ext.get("tasks-button-btnEl"); 
								t.ok(taskButton==null,"Tasks button is not visible");
								
								//Verify if Host management button is not presented
								var hostButton = Ext.get("infrastructurejoin-button-btnEl"); 
								t.ok(hostButton==null,"Host management button is not visible");
								
								//Verify if OMS Shell tab is not presented
								var omsShellTab = Ext.ComponentQuery.query("#oms-shell");
								var omsShellTabItem = Ext.get(omsShellTab).item(0);
								t.ok(omsShellTabItem==null,"OMS Shell tab is not visible");
								
								//Verify if VM Map tab is not presented
								var vmMapTab = Ext.ComponentQuery.query("#vmmap");
								var vmMapTabItem = Ext.get(vmMapTab).item(1);
								t.ok(vmMapTabItem==null,"VM Map tab is not visible");

								next();
								
							},
							
							function(next){
								t.diag("3 step: Verify if required buttons are presented");
								
								//Verify if Logout button is presented
								var logoutButton = Ext.get("logout-button-btnEl"); 
								t.ok(logoutButton!=null,"Logout button is visible");
								
								//Verify if Logout button has correct text 'Log out'
								var logoutButtonText = Ext.get("logout-button-btnInnerEl"); 
								t.is(logoutButtonText.dom.textContent, "Log out", "Logout button has correct text 'Log out'");
								
								next();
							}
							
				    );

				}
				next();
			}
    );
});
