Ext.define('opennodeconsole.store.Computes', {
    extend: 'Ext.data.Store',
    model: 'opennodeconsole.model.Compute',

    // TODO: Replace this with actual data from the server.
    data: [{
        name: 'virt1.opennodecloud.com', status: 'online', ip_address: '192.168.1.1', type: 'OpenNode',
        cpu: 'Intel Xeon 12.0GHz', memory: '2048MB', os_release: 'build 37', kernel: '2.6.18-238.9.1.el5.028stab089.1'
    }, {
        name: 'virt2.opennodecloud.com', status: 'online', ip_address: '192.168.1.2', type: 'OpenNode',
        cpu: 'Intel Xeon 12.0GHz', memory: '2048MB', os_release: 'build 37', kernel: '2.6.18-238.9.1.el5.028stab089.1'
    }, {
        name: 'virt3.opennodecloud.com', status: 'offline', ip_address: '192.168.1.3', type: 'OpenNode',
        cpu: 'Intel Xeon 12.0GHz', memory: '2048MB', os_release: 'build 37', kernel: '2.6.18-238.9.1.el5.028stab089.1'
    }]

    // proxy: {
    //     type: 'ajax',
    //     url: '/compute/',
    //     reader: {
    //         type: 'json',
    //     }
    // }
});
