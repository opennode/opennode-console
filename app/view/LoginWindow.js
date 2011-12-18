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
            html: '<img src="img/onc_logo_login.png" alt="OpenNode Console" width="290px" height="59px" />'
        }, {
            emptyText: "Username",
            name: 'username',
            value: 'erik'
        }, {
            emptyText: "Password",
            inputType: 'password',
            name: 'password',
            value: '1'
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

                    Ext.Ajax.request({
                        method: 'POST',
                        url: BACKEND_PREFIX + 'auth',
                        jsonData: {
                            'username': values['username'],
                            'password': values['password']
                        },
                        success: function(response) {
                            var result = Ext.decode(response.responseText);

                            var window = button.up('window');
                            window.destroy();
                            window.fireEvent('login', result['token']);
                        }.bind(this),
                        failure: function() {
                            button.up('window').down('#errormsg').setText("Invalid username or password");
                        }
                    });
                }.bind(this)
            }
        }]
    }]
});
