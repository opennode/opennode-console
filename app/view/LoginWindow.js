Ext.define('Onc.view.LoginWindow', {
    extend: 'Ext.Window',
    alias: 'widget.loginwindow',

    modal: true,
    autoShow: true,
    closable: false,
    draggable: false,
    resizable: false,
    border: false,

    title: "Log in",

    initComponent: function() {
        this.callParent(arguments);
        this.addEvents('login');
    },

    items: [{
        xtype: 'form',
        frame: true,
		width: 310,
        defaults: {
            xtype: 'textfield',
            anchor: '100%',

            listeners:{
                specialKey: function(field, el) {
                    if (el.getKey() === Ext.EventObject.ENTER) {
                        var btn = field.up('form').down('#submit-btn');
                        btn.fireEvent('click', btn);
                    }
                }
            }

        },

        items: [{
            xtype: 'panel',
            border: false,
            bodyStyle: 'background: inherit',
            bodyPadding: 5,
            html: '<img src="'+Ext.IMG_LOGO_LOGIN+'" alt="OpenNode Console" width="290px" height="59px" />'
        }, {
            emptyText: "Username",
            name: 'username',
            width: '100%',
            listeners: {
                afterrender: function(field) {
                    field.focus(false, 500);
                }
            }
        }, {
            emptyText: "Password",
            inputType: 'password',
            name: 'password',
            width: '100%'
        }, {
            itemId: 'errormsg',
            xtype: 'label',
            style: 'color: red'
        }],

        buttons: [{
            itemId: 'submit-btn',
            text: "Log in",
            listeners:{
                'click': function(button, _) {
                    var form = button.up('form').getForm();
                    if (!form.isValid()) return;

                    var values = form.getFieldValues();

                    if (!values['username']) return;

                    button.up('window').setLoading(true);
                    var r = Onc.core.Backend.request('POST', 'auth', {
                        successCodes: [403],
                        jsonData: {
                            'username': values['username'],
                            'password': values['password']
                        },
                        success: function(response) {
                            var window = button.up('window');
                                if (window) {
                                    window.destroy();
                                    window.fireEvent('login', response['token']);
                                 }
                        }.bind(this),
                        failure: function(response) {
                            var window = button.up('window');
                            window.setLoading(false);
                            window.down('#errormsg').setText("Invalid username or password");
                        }
                    });
                }.bind(this)
            }
        }]
    }]
});
