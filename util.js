function dict(kvs) {
    if (arguments.length > 1)
        kvs = Array.prototype.slice.apply(arguments);
    if (kvs.length % 2 !== 0)
        throw new Error("dict() takes an even number of arguments");
    var ret = {};
    for (var i = kvs.length - 1; i >= 0; i -= 2)
        ret[kvs[i - 1]] = kvs[i];
    return ret;
}

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

function clone(obj) {
    var ret = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            ret[key] = obj[key];
    }
    return ret;
}

function idx(field_idx) {
    return function(value) {
	return value[field_idx];
    }
}

function succeed() {
    var d = new Onc.util.Deferred();
    d.callback.apply(d, arguments);
    return d;
}

function fail() {
    var d = new Onc.util.Deferred();
    d.errback.apply(d, arguments);
    return d;
}

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
