Ext.define('opennodeconsole.view.compute.List', {
    extend: 'Ext.view.View',
    alias: 'widget.computelist',

    store: 'Computes',
    tpl: [
        '<tpl for=".">',
        '    <div class="compute status-{status}">',
        '        <div class="status-icon"></div>',
        '        <div class="descr">',
        '            <div class="hostname">{hostname}</div>',
        '            {ip_address} / {type}',
        '        </div>',
        '    </div>',
        '</tpl>'
    ],
    emptyText: 'No computes to display',

    id: 'compute-list',
    overItemCls: 'x-item-over',
    itemSelector: '.compute',
    bodyPadding: 5,
    autoScroll: true,

    initComponent: function() {
        this.callParent(arguments);

        this.store.on('load', function(store, records) {
            if (records.length > 0)
                this.select(0);
        }, this);
    }
});


Ext.define('opennodeconsole.view.compute.ListFilter', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.computelistfilter',

    layout: 'hbox',

    items: {
        xtype: 'textfield',
        flex: 1,
        inputId: 'filter',
        emptyText: "Filter by..."
    }
});
