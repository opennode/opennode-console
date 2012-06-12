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
        bodyStyle: 'background: inherit',
        bodyPadding: 4
    },

    initComponent: function(){
        this.items = [{
            xtype: 'form',
            itemId: 'formInfrastructureJoin',
            items: [{
                store: this.incomingNodesStore,
                xtype: 'grid',
                title: 'Requests',
                height: 160,
                autoScroll: true,
                columns: [{
                    text     : 'Hostname',
                    flex     : 1,
                    sortable : false,
                    dataIndex: 'hostname'
                }, {
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [{
                        icon: 'img/icon/accept.png',
                        text: 'Accept',
                        altText: 'Accept',
                        tooltip: 'Accept',
                        handler: function(grid, rowIndex, colIndex){
                            this.acceptHost(grid.store.data.items[rowIndex].raw[0]);
                        }.bind(this)
                    },{
                        icon: 'img/icon/delete.png',
                        text: 'Reject',
                        altText: 'Reject',
                        tooltip: 'Reject',
                        handler: function(grid, rowIndex, colIndex){
                            this.rejectHost(grid.store.data.items[rowIndex].raw[0]);
                        }.bind(this)
                    }]
                }],
                viewConfig: {
                    stripeRows: true
                }
            },{
                store: this.registeredNodesStore,
                xtype: 'grid',
                title: 'Registered hosts',
                height: 160,
                autoScroll: true,
                columns: [{
                    text     : 'Hostname',
                    flex     : 1,
                    sortable : false,
                    dataIndex: 'hostname'
                }, {
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [{
                        icon: 'img/icon/delete_edit.gif',
                        text: 'Delete',
                        altText: 'Delete',
                        tooltip: 'Delete',
                        handler: function(grid, rowIndex, colIndex){
                            this.deleteHost(grid.store.data.items[rowIndex].raw[0]);
                        }.bind(this)
                    }]
                }],
                viewConfig: {
                    stripeRows: true
                }
            }],
            buttons:[{
                text: 'Cancel', handler: function(){
                    this.up('window').destroy();
                }
            }]
        }];
        this.callParent(arguments);
        this.addEvents('hostAccept', 'hostReject', 'hostDelete');
    },
    acceptHost: function(val){
        this.fireEvent('hostAccept', this, val);
    },
    rejectHost: function(val){
        this.fireEvent('hostReject', this, val);
    },
    deleteHost: function(val){
        this.fireEvent('hostDelete', this, val);
    }
});
