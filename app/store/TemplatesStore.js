Ext.define('Onc.store.TemplatesStore', {
    extend: 'Ext.data.Store',
    model: 'Onc.model.Template',
    sorters: [{
        property: 'name',
        transform: function(val) {
            return val.toLowerCase();
        }
    }],

    data: [{
        "name": "owncloud-4.0.0-x86_64-asys",
        "base_type": "openvz",
        "cores": [1, 1, 1],
        "memory": [0.25, 0.5, 0.5],
        "swap": [0.0, 0.25, 0.25],
        "disk": [2.0, 10.0, 10.0],
        "cpu_limit": [50, 50],
        "password": "passwd",
        "ip": "192.168.0.1",
        "nameserver": "192.168.0.1",
        "tags": ["virt_type:openvz", "type:template"],
        "id": "0158c908-af4c-40fe-a3d7-37e7d006d063",
        "__type__": "Template",
        "url": "/machines/973cf553-eea4-55c4-aeeb-c8e0a58dd2d0/templates/0158c908-af4c-40fe-a3d7-37e7d006d063/",
        "permissions": ["admin", "security"]
    }, {
        "name": "openvpn-2.2.1-x86_64-asys",
        "base_type": "openvz",
        "cores": [1, 1, 1],
        "memory": [0.25, 0.5, 0.5],
        "swap": [0.0, 0.25, 0.25],
        "disk": [2.0, 10.0, 10.0],
        "cpu_limit": [50, 50],
        "password": "passwd",
        "ip": "192.168.0.1",
        "nameserver": "192.168.0.1",
        "tags": ["virt_type:openvz", "type:template"],
        "id": "b3cf65da-e401-45c0-b5f1-6f307b562ad6",
        "__type__": "Template",
        "url": "/machines/973cf553-eea4-55c4-aeeb-c8e0a58dd2d0/templates/b3cf65da-e401-45c0-b5f1-6f307b562ad6/",
        "permissions": ["admin", "security"]
    }, {
        "name": "bind-9.7-x86-64-asys",
        "base_type": "openvz",
        "cores": [1, 1, 1],
        "memory": [0.25, 0.5, 0.5],
        "swap": [0.0, 0.25, 0.25],
        "disk": [2.0, 10.0, 10.0],
        "cpu_limit": [50, 50],
        "password": "passwd",
        "ip": "192.168.0.1",
        "nameserver": "192.168.0.1",
        "tags": ["virt_type:openvz", "type:template"],
        "id": "d3c2e8b9-5128-42dc-a82a-bb9b27093946",
        "__type__": "Template",
        "url": "/machines/973cf553-eea4-55c4-aeeb-c8e0a58dd2d0/templates/d3c2e8b9-5128-42dc-a82a-bb9b27093946/",
        "permissions": ["admin", "security"]
    }, {
        "name": "dokuwiki-x86_64-on",
        "base_type": "openvz",
        "cores": [1, 1, 1],
        "memory": [0.25, 0.5, 0.5],
        "swap": [0.0, 0.25, 0.25],
        "disk": [2.0, 10.0, 10.0],
        "cpu_limit": [50, 50],
        "password": "passwd",
        "ip": "192.168.0.1",
        "nameserver": "192.168.0.1",
        "tags": ["virt_type:openvz", "type:template"],
        "id": "15f624a8-57f0-46ba-a870-fd74c3379ee7",
        "__type__": "Template",
        "url": "/machines/973cf553-eea4-55c4-aeeb-c8e0a58dd2d0/templates/15f624a8-57f0-46ba-a870-fd74c3379ee7/",
        "permissions": ["admin", "security"]
    }, {
        "name": "centos-6-x86-asys",
        "base_type": "openvz",
        "cores": [1, 1, 4],
        "memory": [0.5, 3.0, 8.0],
        "swap": [0.0, 1.0, 4.0],
        "disk": [2.0, 2.0, 10.0],
        "cpu_limit": [50, 50],
        "password": "passwd",
        "ip": "192.168.0.1",
        "nameserver": "192.168.0.1",
        "tags": ["virt_type:openvz", "type:template"],
        "id": "",
        "__type__": "Template",
        "url": "",
        "permissions": ["admin", "security"]
    }, {
        "name": "fedora-17-x86-asys",
        "base_type": "openvz",
        "cores": [1, 1, 4],
        "memory": [0.5, 3.0, 8.0],
        "swap": [0.0, 1.0, 4.0],
        "disk": [2.0, 2.0, 10.0],
        "cpu_limit": [50, 50],
        "password": "passwd",
        "ip": "192.168.0.1",
        "nameserver": "192.168.0.1",
        "tags": ["virt_type:openvz", "type:template"],
        "id": "",
        "__type__": "Template",
        "url": "",
        "permissions": ["admin", "security"]
    }, {
        "name": "suse-12.2-x86-asys",
        "base_type": "openvz",
        "cores": [1, 1, 4],
        "memory": [0.5, 3.0, 8.0],
        "swap": [0.0, 1.0, 4.0],
        "disk": [2.0, 2.0, 10.0],
        "cpu_limit": [50, 50],
        "password": "passwd",
        "ip": "192.168.0.1",
        "nameserver": "192.168.0.1",
        "tags": ["virt_type:openvz", "type:template"],
        "id": "",
        "__type__": "Template",
        "url": "",
        "permissions": ["admin", "security"]
    }, {
        "name": "ubuntu-8.04-x86-asys",
        "base_type": "openvz",
        "cores": [1, 1, 4],
        "memory": [0.5, 3.0, 8.0],
        "swap": [0.0, 1.0, 4.0],
        "disk": [2.0, 2.0, 10.0],
        "cpu_limit": [50, 50],
        "password": "passwd",
        "ip": "192.168.0.1",
        "nameserver": "192.168.0.1",
        "tags": ["virt_type:openvz", "type:template"],
        "id": "",
        "__type__": "Template",
        "url": "",
        "permissions": ["admin", "security"]
    }],
    /*
     * proxy: { type: 'onc', reader: 'json', url: 'templates/' }
     */
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
