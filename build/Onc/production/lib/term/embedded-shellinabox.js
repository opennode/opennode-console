baseUrl = 'http://82.131.63.12:18080/terminal';

var Console = function(name, host, url) {
    this.name = name;
    this.host = host;
    this.url = url;

    this.connectionUrl = function() {
        return baseUrl + this.url;
    };
};

function ArbitraryConsole(name, url) {
    Console.call(this, name, '', url);
    this.parameters = true;

    this.user = ko.observable('pippo')
    this.host = ko.observable('localhost')

    this.connectionUrl = function() {
        return this.__proto__.connectionUrl.call(this, name, '', url) + "?user=" + this.user() + "&host=" + this.host();
    };
}


ArbitraryConsole.prototype = new Console;

consoles = [new Console('Commandline management interface', 'OMS Commandline management interface', '/management'),
            new Console('Connection to virtual machine', 'localhost', '/test_ssh'),
            new ArbitraryConsole('Connection to arbitrary machine', '/test_arbitrary')]

var viewModel = {
    selectedConsole: ko.observable(consoles[0]),
    consoles: ko.observableArray(consoles),
    reconnect: function() { createShell(this.connectionUrl()); }
};

ko.bindingHandlers.shell = {
    init: function(element) {
    },
    update: function(element, valueAccessor) {
        createShell(valueAccessor().console);
    }
};

function createShell(url) {
    if(!url)
        return;

    var shell = new ShellInABox(url);
    setTimeout(function() {
        shell.indicateSize = true;
    }, 100);

    $(window).resize(function() {
        $("#vt100").height($(window).height() - $("#vt100").position().top - 20);
        shell.resizer();
        shell.showCurrentSize();
    });
    $(window).resize();
}

$(function() {
    // We would like to hide overflowing lines as this can lead to
    // visually jarring results if the browser substitutes oversized
    // Unicode characters from different fonts. Unfortunately, a bug
    // in Firefox prevents it from allowing multi-line text
    // selections whenever we change the "overflow" style. So, only
    // do so for non-Netscape browsers.
    if (typeof navigator.appName == 'undefined' ||
        navigator.appName != 'Netscape') {
        document.write('<style type="text/css">' +
                       '#vt100 #console div, #vt100 #alt_console div {' +
                       '  overflow: hidden;' +
                       '}' +
                       '</style>');
    }

    ko.applyBindings(viewModel);
});
