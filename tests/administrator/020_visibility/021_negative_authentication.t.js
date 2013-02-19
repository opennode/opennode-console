StartTest(function (t) {
	
	t.diag("Use Case: Login to onc as non existing user");
	
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
				var goon = loginWindow();
				if (goon == true){
					
					t.chain(

							{
								action : 'click',
								target : '[name="username"]'
							},
							{
								action : 'type',
								target : '[name="username"]',
								text : 'no_user'
							},
							{
								action : 'click',
								target : '[name="password"]'
							},
							{
								action : 'type',
								target : '[name="password"]',
								text : 'no_passwd'
							},
							{
								action : 'click',
								target : '[id="button-1017-btnEl"]'
							},
							function(){
								// Verify if login screen is displayed after incorrect login
								goon = loginWindow();
								t.ok(goon == true, "Non existing user cann't login to onc.");
								
								//Verify if error message is displayed after incorrect login
								var loginError = Ext.get(Ext.ComponentQuery.query("#errormsg")).item(0);
								t.ok(loginError.dom.html=="Invalid username or password", "Error message is displayed.");
							}
				    
				    );

				} else {
					t.fail('PLEASE DO MANUAL LOGOUT AND RERUN TEST !!!!');
				}
				next();
			}
    );
});