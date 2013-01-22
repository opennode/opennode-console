StartTest(function (t) {
	
	t.diag("Use Case: Select VM");
		
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
				clickEl(t,"#tab-1097-btnEl", next);
			},

			function(next){
				clickEl(t,"#button-1093-btnEl", next);
			},
			
			function(next){
				clickEl(t,"#template-inputEl", next);
			},
			
			function(next){
				t.type('#template-inputEl', 'oms.template (openvz)', next);
			},
			
			function(next){
				clickEl(t,".x-window", next);
			},
			
			function(next){
				t.selectText("#hostname-inputEl");
				next();
			},
			{
				action : 'type',
				text : "oms.autotest"
			},
			
			function(next){
				clickEl(t,'span:contains("Create")', next);
			}
			
			
    );

});