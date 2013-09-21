Ext.define('Onc.view.InfrastructureJoinView', {
    extend: 'Ext.window.Window',
    alias: 'widget.infrastructurejoin',

    title: 'ONC Settings',
    modal: true,
    border: false,
    width: 300,
    resizable: false,
    itemId: 'infrastructureJoin',

    config: {
        incomingNodesStore: null,
        registeredNodesStore: null
    },

    defaults: {
        border: false,
        bodyStyle: 'background: inherit'
    },

    initComponent: function(){
        this.items = [{
            xtype: 'form',
            itemId: 'formInfrastructureJoin',
            items: [{
                xtype: 'grid',
                store: 'IncomingNodesStore',
                title: 'Requests',
                height: 160,
                margin: '0 0 5 0',
                autoScroll: true,
                columns: [{
                    text: 'Hostname',
                    flex: 1,
                    sortable: false,
                    dataIndex: 'hostname'
                }, {
                    xtype: 'actioncolumn',
                    renderer: function (val, metadata, record, rowIndex, colIndex, store) {
		                if (record.get('status') === "accepting") {
		                   this.items[0].icon = '';
		                   this.items[1].icon = '';
		                   this.items[2].icon='resources/img/icon/loading.gif';//hidden setting not working
		                } else {
		                   this.items[0].icon = 'resources/img/icon/accept.png';
		                   this.items[1].icon = 'resources/img/icon/delete.png';
		                   this.items[2].icon='';
		                }
		                return val;
		            },
                    width: 50,
                    items: [{
                        icon: 'resources/img/icon/accept.png',
                        text: 'Accept',
                        altText: 'Accept',
                        tooltip: 'Accept',
                        handler: function(grid, rowIndex, colIndex){
                            this._acceptHost(grid.store.getAt(rowIndex).get('hostname'));
                        }.bind(this)
                    },{
                        icon: 'resources/img/icon/delete.png',
                        text: 'Reject',
                        altText: 'Reject',
                        tooltip: 'Reject',
                        handler: function(grid, rowIndex, colIndex){
                            this._rejectHost(grid.store.getAt(rowIndex).get('hostname'));
                        }.bind(this)
                    },{
                        icon: ''
                    }]
                }],
                viewConfig: {
                    stripeRows: true
                }
            },{
                xtype: 'grid',
                store: 'RegisteredNodesStore',
                title: 'Registered hosts',
                height: 160,
                autoScroll: true,
                columns: [{
                    text: 'Hostname',
                    flex: 1,
                    sortable: false,
                    dataIndex: 'hostname'
                }, {
                    xtype: 'actioncolumn',
                    width: 50,
                    renderer: function (val, metadata, record, rowIndex, colIndex, store, gridView) {
		                if (record.get('status') == "deleting") {
		                   this.items[0].icon='';
		                   this.items[1].icon='resources/img/icon/loading.gif';//hidden setting not working
		                } else {
		                   this.items[0].icon='resources/img/icon/delete_edit.gif';
		                   this.items[1].icon='';
		                }
		                return val;
		            },
                    items: [{
                        icon: 'resources/img/icon/delete_edit.gif',
                        text: 'Delete',
                        altText: 'Delete',
                        tooltip: 'Delete',
                        handler: function(grid, rowIndex, colIndex){
                            this._deleteHost(grid.store.getAt(rowIndex).get('hostname'));
                        }.bind(this)
                    },{
                        icon: ''
                    }]
                }],
                viewConfig: {
                    stripeRows: true
                }
            }],
            buttons:[{
                text: 'Reload', handler: function(){
                    this.fireEvent('reload', this);
                }.bind(this)
            }, {
                text: 'Close', handler: function(){
                    this.up('window').destroy();
                }
            }]
        }];

        this.callParent(arguments);

        this.addEvents('hostAccept', 'hostReject', 'hostDelete', 'reload');
    },


    _acceptHost: function(hostname){
        this.fireEvent('hostAccept', this, hostname);
    },

    _rejectHost: function(hostname){
        this._performActionWithConfirmation(
                'Reject Host',
                'Are you sure you want to reject host <b>{0}<b>'.format(hostname),
                'hostReject', hostname);
    },

    _deleteHost: function(hostname){
        this._performActionWithConfirmation(
                'Delete Host',
                'Are you sure you want to delete host <b>{0}<b>'.format(hostname),
                'hostDelete', hostname);
    },

    _performActionWithConfirmation: function(confirmTitle, confirmText, eventName, hostname) {
        Ext.Msg.confirm(confirmTitle, confirmText,
            function(choice) {
                if (choice === 'yes') {
                    this.fireEvent(eventName, this, hostname);
                };
            }.bind(this)
        );
    }
});
