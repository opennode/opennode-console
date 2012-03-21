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

String.prototype.capitalize = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
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
Array.prototype.delmassoc = function(k) {
    for (var i = this.length - 1; i >= 0; i -= 1) {
        if (this[i][0] === k) {
            this.splice(i, 1);
        }
    }
};

Array.prototype.delmassocRegexp = function(k) {
    for (var i = this.length - 1; i >= 0; i -= 1) {
        if (this[i][0].match(k)) {
            this.splice(i, 1);
        }
    }
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

Number.prototype.round = function(precision) {
    if (precision === undefined)
        return Math.round(this);
    else
        return Math.round(this * Math.pow(10, precision)) / Math.pow(10, precision);
};


Array.prototype.clear = function() { return this.splice(); };
