Ext.BLANK_IMAGE_URL = 'ext-4.0/resources/themes/images/default/tree/s.gif';

Ext.Loader.setConfig('paths', {
    'Ext': 'ext-4.0/src',
    'Onc': './app/Onc'
});

Ext.Loader.setConfig({enabled: true, disableCaching: false})

Ext.syncRequire([
    'Ext.window.MessageBox',
    'Ext.XTemplate',
    'Onc.widgets.Gauge',
    'Onc.widgets.Shell',
    'Onc.widgets.Vnc',
    'Onc.tabs.Tab',
    'Onc.tabs.StatusTab',
    'Onc.tabs.SystemTab',
    'Onc.tabs.NetworkTab',
    'Onc.tabs.StorageTab',
    'Onc.tabs.TemplatesTab',
    'Onc.tabs.ShellTab',
    'Onc.tabs.VncTab',
    'Onc.polymorphic.Reader',
    'Onc.polymorphic.Association',

    'Onc.hub.Hub',
    'Onc.hub.Sync'
]);

Ext.application({
    name: 'Onc',

    appFolder: 'app',
    controllers: ['MainController', 'ComputeController', 'NewVmController'],
    autoCreateViewport: true,

    launch: function() {
        Onc.hub.Hub.run();
    }
});

Ext.override(Ext.Base, {
    toString: function() {
        return '<{0}>'.format(this.$className);
    },

    cls: function() { return this.$className.split('.').pop(); }
});


if (typeof console === 'undefined') {
    var c = console = {};
    c.debug = c.log = c.error = c.warn = c.assert = Ext.emptyFn;
}


// These are essentially IP address normalisers.
Ext.apply(Ext.data.SortTypes, {
    asIpv4: function(value) {
        return IPAddress.normalizeIpv4(value).addr;
    },

    asIpv6: function(value) {
        return IPAddress.normalizeIpv6(value).addr;
    }
});


IPAddress = {
    normalizeIpv4: function(value) {
        var addrAndPrefixLen = value.split('/');
        var address = addrAndPrefixLen[0];
        var prefixLen = parseInt(addrAndPrefixLen[1]);
        console.assert(Ext.isNumber(prefixLen));

        var normalizedAddr = value.split('.').map(function(part) {
            return part.lpad(3, '0');
        }).join('.');

        var netmask = [0, 8, 16, 24].map(function(i) {
            var numBitsInGroup = (prefixLen - i).constrain(0, 8);
            var groupInBin = '1'.repeat(numBitsInGroup).rpad(8, '0');
            return parseInt(groupInBin, 2);
        });

        return {
            addr: normalizedAddr,
            prefixLen: prefixLen,
            netmask: netmask.join('.')
        };
    },

    normalizeIpv6: function(value) {
        var addrAndPrefixLen = value.split('/');
        var address = addrAndPrefixLen[0];
        var prefixLen = parseInt(addrAndPrefixLen[1]);
        console.assert(Ext.isNumber(prefixLen));
        var groups = address.split(':');

        if (/[^0-9a-f:]/i.test(address) ||  // Chars other than HEX or :
            /[^:]{5,}/.test(address) ||  // More than 4 digits in a group
            /:{3,}/.test(address) ||  // :::, ::::, etc
            /:{2}/.test(address) && groups.length === 8 ||  // Extraneous ::
            groups.length > 8 ||
            groups.length < 8 && !/:{2}/.test(address))  // Missing ::
        {
            throw new Error('Invalid IPv6 address format');
        }

        if (groups.length < 8) {
            var extraZeroGroups = ['0000'].repeat(8 - groups.length + 1);
            var i = groups.indexOf('');
            console.assert(i !== -1);
            groups.splice.apply(groups, [i, 1].concat(extraZeroGroups));
            console.assert(groups.length === 8);
        }

        var normalizedAddr = groups.map(function(part) {
            return part.lpad(4, '0');
        }).join(':');
        return {addr: normalizedAddr,
                prefixLen: prefixLen};
    }
};


String.prototype.repeat = function(n) {
    var ret = '';
    for (var i = n; i > 0; i -= 1)
        ret += this;
    return ret;
};


String.prototype.reverse = function() {
    return this.split(new RegExp('')).reverse().join('');
};


String.prototype.lpad = function(n, c) {
    return Ext.String.leftPad(this, n, c);
};


String.prototype.rpad = function(n, c) {
    return this.reverse().lpad(n, c).reverse();
};


String.prototype.startswith = function(substr) {
    return this.substr(0, substr.length) === substr;
};

String.prototype.format = function() {
    var args = [this];
    args.push.apply(args, arguments);
    return Ext.String.format.apply(Ext.String, args);
};


Array.prototype.repeat = function(n) {
    ret = [];
    for (var i = n; i > 0; i -= 1)
        ret = ret.concat(this);
    return ret;
};

Array.prototype.contains = function(i) {
    return Ext.Array.contains(this, i);
};


Array.prototype.setassoc = function(k, v) {
    for (var i = this.length - 1; i >= 0; i -= 1) {
        if (this[i][0] === k) {
            this[i][1] = v;
            return v;
        }
    }
    this.push([k, v]);
    return v;
};
Array.prototype.assoc = function(k, dflt) {
    for (var i = this.length - 1; i >= 0; i -= 1) {
        if (this[i][0] === k)
            return this[i][1];
    }
    return dflt;
};
Array.prototype.delassoc = function(k) {
    for (var i = this.length - 1; i >= 0; i -= 1) {
        if (this[i][0] === k) {
            this.splice(i, 1);
            break;
        }
    }
};

Array.prototype.setmassoc = function(k, v) {
    for (var i = this.length - 1; i >= 0; i -= 1) {
        var k1 = this[i][0];
        var v1 = this[i][1];
        if (k1 === k && v1 === v)
            return;
    }
    this.push([k, v]);
};
Array.prototype.massoc = function(k) {
    var ret = [];
    for (var i = this.length - 1; i >= 0; i -= 1) {
        if (this[i][0] === k)
            ret.push(this[i][1]);
    }
    return ret;
};
Array.prototype.massocKeys = function() {
    return Ext.Array.unique(this.map(function(kv) { return kv[0]; }));
};
Array.prototype.massocValues = function() {
    return Ext.Array.unique(this.map(function(kv) { return kv[1]; }));
};
Array.prototype.massocForEach = function(fun) {
    var me = this;
    this.massocKeys().forEach(function(key) {
        fun(key, me.massoc(key));
    });
};
Array.prototype.assocForEach = function(fun) {
    this.forEach(function(pair) { fun(pair[0], pair[1]); });
};

Array.prototype.flatten = function() {
    var ret = [];
    this.forEach(function(i) {
        ret.push.apply(ret, i);
    });
    return ret;
};

Array.prototype.keep = function(f) {
    return this.filter(function(i) { return !f(i); });
};


Number.prototype.constrain = function(a, b) {
    return Math.min(b, Math.max(a, this));
};

/**
 * Amends existing methods to print out their name, arguments and return value.
 *
 * Useful for peeking into existing framework methods. Ignores
 * non-existing names, so changing 'methodName' to e.g. '#methodName'
 * will effectively comment out that item.
 */
function inspectMethods(methodNames, ctor) {
    methodNames.forEach(function iterator(name) {
        if (name in ctor.prototype) {
            var stuff = {};
            stuff[name] = function() {
                var ret = this.callParent(arguments);
                if (ret !== undefined)
                    console.debug(name, "(", (arguments.length ? arguments : ''), ") => ", ret)
                else
                    console.debug(name, "(", (arguments.length ? arguments : ''), ")")
                return ret;
            };
            Ext.override(ctor, stuff);
        }
    });
}

Ext.data.Association.create = function(association){
    if (!association.isAssociation) {
        if (Ext.isString(association)) {
            association = {
                type: association
            };
        }

        switch (association.type) {
        case 'belongsTo':
            return Ext.create('Ext.data.BelongsToAssociation', association);
        case 'hasMany':
            return Ext.create('Ext.data.HasManyAssociation', association);
        case 'polymorphic':
            return Ext.create('association.polymorphic', association);
        default:
            //<debug>
            Ext.Error.raise('Unknown Association type: "' + association.type + '"');
            //</debug>
        }
    }
    return association;
};


function dict(kvs) {
    if (arguments.length > 1)
        kvs = Array.prototype.slice.apply(arguments);
    if (kvs.length % 2 !== 0)
        throw new Error("dict() takes an even number of arguments");
    var ret = {};
    for (var i = kvs.length - 1; i >= 0; i -= 2)
        ret[kvs[i - 1]] = kvs[i];
    return ret;
};


function dump(obj) {
    if (obj instanceof Array)
        return '[' + obj.map(function(i) { return dump(i); }).join(', ') + ']';
    else if (typeof obj === 'number' || obj instanceof Number)
        return ''+obj;
    else if (typeof obj === 'string' || obj instanceof String)
        return '"' + obj.replace('"', '\"') + '"';
    else if (typeof obj === 'boolean' || obj instanceof Boolean)
        return obj ? 'true' : 'false'
    else if (obj === null)
        return 'null';
    else if (obj === undefined)
        return 'undefined';
    else if (obj instanceof Date)
        return '"' + obj.toString() + '"';
    else if (obj instanceof Object) {
        var pairs = [];
        Ext.Object.each(obj, function(key, value) {
            pairs.push(key + ': ' + dump(value));
        });
        return '{' + pairs.join(', ') + '}';
    }
}


function empty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
