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
        return this.username;
    },

    isAdmin: function() {
        if (!this.groups)
            return false;
        return this.groups.indexOf('admins') > -1;
    }

});
