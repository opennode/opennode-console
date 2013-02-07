StartTest(function (t) {
	
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
				goon = verifyIfUserIsLoggedIn(t,"admin");
				if (goon == true){

					t.chain(
							{
								waitFor : 4000
							},
							function(next){
								clickEl(t,".descr", next);
							},
							function(next){
								// Select VMs tab
								t.diag("2 step: Select VMs tab");
								var elem = Ext.get(".x-tab-inner"); 
								console.log(elem);
								next();
							},
							function(){
//								var omsShellTab = Ext.ComponentQuery.query("#oms-shell");
//								var omsShellTabItem = Ext.get(omsShellTab).item(0);
//								t.click(omsShellTabItem.dom.tab.el.dom);
//								
//								var vmMapTab = Ext.ComponentQuery.query("#vmmap");
//								var vmMapTabItem = Ext.get(vmMapTab).item(1);
//								console.log(vmMapTabItem.dom.tab.el.dom);
								

								
//								console.log(Ext.get(Ext.ComponentQuery.query("#tabpanel-1034")));
								
																
//								var vm = Ext.ComponentQuery.query("#search-results");
//								var vmItem = Ext.get(vm).item(0).dom.all.elements;
//								console.log(vmItem);
								//t.click(vmMapTabItem.dom.tab.el.dom);
								
								
								//console.log(Ext.ComponentQuery.query("#mainTabs"));
								//t.ok(omsShellTab==null,"OMS Shell tab is not visible");
							}

//							
//							function(next){
//								// Select VMs tab
//								t.diag("2 step: Select VMs tab");
//								clickEl(t,"span:contains('VMs')", next);
//							},
//
//							function(next){
//								waitForEl(t,'.x-grid-table');
//								next();
//							},
//							
//							function(next){
//								//var button1 = Ext.ComponentQuery.query('#new-vm-button');
//								//console.log(button1);
//								
//								
//								
//								//console.log(Ext.get(button1));
//								//console.log(Ext.get(button1).item(0));
//
//								
//								//alert(Ext.getBody());
//								//alert(Ext.getDom(Ext.getBody()));
//								//alert(Ext.get(Ext.get(button1).item(0)));
//								//alert(Ext.getDom(Ext.getDom(Ext.get(Ext.get(button1).item(0)))));
//								//alert(Ext.getDom(Ext.getDom(Ext.get(button1)).item(0)));
//								var button2 = Ext.query;
//								console.log(button2);
//								//button2.on('click', button2.handler);
//								//button2.handler;
//
//
//							}
							
				    );
				}
			}
			

			
    );

});



