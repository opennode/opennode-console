Ext.define('Onc.model.AuthenticatedUser', {

    singleton: true,

    username: null,
    groups: null,

    parseIdCommand: function(response) {
        //Sample input: user: opennode\ngroups: admins\neffective_principals: opennode admins\n
        var creds = response.stdout[0].split('\n');
        this.username = creds[0].split(': ')[1];
        this.groups = creds[1].split(': ')[1].split(' ');
    },

    reset: function() {
        this.username = null;
        this.groups = null;
    },

    getUsername: function() {
        console.log("Called get username", this.username);
        return this.username;
    }

});