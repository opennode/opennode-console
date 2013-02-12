StartTest(function (t) {
	
	t.diag("Use Case: Login to onc as admin and verify if required buttons and tabs are presented");
	
	t.chain(
   		
			function(next){
				t.chain(
						{
							waitFor : 1000
						},
						next
				);
			},
			
			function(next){
				var goon = verifyIfUserIsLoggedIn(t,"admin");
				if (goon == true){
					
					t.chain(
					   		
							{
									waitFor : 5000
							},

							function(next){

								t.diag("2 step: Verify if required buttons and tabs are presented");
								//Verify if Tasks button is presented
								var taskButton = Ext.get("tasks-button-btnEl"); 
								t.ok(taskButton!=null,"Tasks button is visible");
								
								//Verify if Tasks button has correct text 'Tasks'
								var taskButtonText = Ext.get("tasks-button-btnInnerEl"); 
								t.is(taskButtonText.dom.textContent, "Tasks", "Tasks button has correct text 'Tasks'");
								
								//Verify if Host management button is presented
								var hostButton = Ext.get("infrastructurejoin-button-btnEl"); 
								t.ok(hostButton!=null,"Host management button is visible");
								
								//Verify if Host management button has correct text 'Host management'
								var hostButtonText = Ext.get("infrastructurejoin-button-btnInnerEl"); 
								t.is(hostButtonText.dom.textContent, "Host management", "Host management button has correct text 'Host management'");
								
								//Verify if Logout button is presented
								var logoutButton = Ext.get("logout-button-btnEl"); 
								t.ok(logoutButton!=null,"Logout button is visible");
								
								//Verify if Logout button has correct text 'Log out'
								var logoutButtonText = Ext.get("logout-button-btnInnerEl"); 
								t.is(logoutButtonText.dom.textContent, "Log out", "Logout button has correct text 'Log out'");
								
								//Verify if OMS shell button is presented
								var omsShellButton = Ext.get("oms-shell-button-btnEl"); 
								t.ok(omsShellButton!=null,"OMS shell button is visible");
								
								//Verify if OMS shell button has correct text 'OMS Shell'
								var logoutButtonText = Ext.get("oms-shell-button-btnInnerEl"); 
								t.is(logoutButtonText.dom.textContent, "OMS Shell", "OMS shell button has correct text 'OMS Shell'");
								
								
								//Verify if Dashboard tab is presented
								var omsShellTab = Ext.ComponentQuery.query("#dashboard");
								var omsShellTabItem = Ext.get(omsShellTab).item(0);
								t.ok(omsShellTabItem!=null,"Dashboard tab is visible");
								
								//Verify if OMS Shell tab has correct text 'OMS Shell'
								t.is(omsShellTabItem.dom.tab.el.dom.textContent, "Dashboard", "Dashboard tab has correct text 'Dashboard'");

								//Verify if VM Map tab is presented
								var vmMapTab = Ext.ComponentQuery.query("#vmmap");
								var vmMapTabItem = Ext.get(vmMapTab).item(1);
								t.ok(vmMapTabItem!=null,"VM Map tab is visible");
								
								//Verify if VM Map tab has correct text 'VM Map'
								t.is(vmMapTabItem.dom.tab.el.dom.textContent, "VM Map", "VM Map tab has correct text 'VM Map'");

								next();
								
							}
				    
				    );

				}
				next();
			}
    );
});