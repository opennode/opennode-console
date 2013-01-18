function login(t, user, pwd, callback) {
	t.chain(
			{ 
				waitFor : 'selector',
				args : '.x-window-header-text'
			},
			{
				action : 'click',
				target : '[name="username"]'
			},
			{
				action : 'type',
				target : '[name="username"]',
				text : user
			},
			{
				action : 'click',
				target : '[name="password"]'
			},
			{
				action : 'type',
				target : '[name="password"]',
				text : pwd
			},
			{
				action : 'click',
				target : '[id="button-1017-btnEl"]'
			},
			{
				action : 'click',
				target : '[id="button-1017-btnEl"]'
			},
			{ 
				waitFor : 'selector',
				args : '.x-tab-bar'
			},
			function(){
				callback();
			}
	);
	
}
