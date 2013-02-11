StartTest(function (t) {
	
	t.diag("Use Case: Login to onc as admin and verify if required buttons and tabs are presented");
	
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
					   		
							{
									waitFor : 4000
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
								
								//Verify if OMS Shell tab is presented
								var omsShellTab = Ext.ComponentQuery.query("#oms-shell");
								var omsShellTabItem = Ext.get(omsShellTab).item(0);
								t.ok(omsShellTabItem!=null,"OMS Shell tab is visible");
								
								//Verify if OMS Shell tab has correct text 'OMS Shell'
								t.is(omsShellTabItem.dom.tab.el.dom.textContent, "OMS Shell", "OMS Shell tab has correct text 'OMS Shell'");

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