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

function login1(t, user, pwd) {
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
			}
	);
	
}

function clickEl(t, el, callback) {
	t.chain(
			{
				waitFor : 'selector',
				args : el
			},
			{
				action : 'click',
				target : el
			},
			function(){
				callback();
			}
	);
}

function countRows(table){
	// Count all table rows with header row
	var brows = document.querySelector(table).getElementsByTagName("tr").length;
	bdrows = brows - 1;
	return bdrows;
}

function waitForEl(t, el){
	t.chain(
			{
				waitFor : 'selector',
				args : el
			}
	);
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
    	var cookie = cookies[i];
    	var eqPos = cookie.indexOf("=");
    	var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    	alert(name);
    	document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

function verifyIfUserIsLoggedIn(t, user){
	var loginButton = document.getElementById("button-1017-btnEl");
	if (loginButton != null){
		//Login to opennode console as admin:admin
		t.diag("1 step: Login to onc as " + user +":" + user);
		login1(t, user, user);
		return true;
	} else {
		var helloForUser = document.getElementsByTagName("tspan")[0];
		if(helloForUser.textContent=="Hi, " + user + "!"){ 
			t.diag(user + " already logged in");
			return true;
			} else {
				t.fail("PLEASE DO MANUAL LOGOUT AND RERUN TEST !!!!");
				return false;
			}
	}
}



