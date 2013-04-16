Ext.define('Onc.portal.TasksPortlet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.tasksportlet',
    minHeight: 200,
    border: false,

    initMessages: function() {
        var messages = new Ext.util.HashMap();
        messages.add("DEFAULT", "Service {0} is running.");
        messages.add("ERROR", "Service {0} should be running.");
        messages.add("NOTIFY_PAUSED", "Service {0} is paused.");
        this.messages = messages;

    },

    initComponent: function() {
        this.initMessages();
        Ext.getStore('TasksPortletStore').startAutoRefresh(2);
        Ext.apply(this, {
            store: 'TasksPortletStore',
            hideHeaders: true,
            bodyCls: 'tasks-table',
            style: {
                background: "transparent",
            },
            viewConfig: {
                loadMask: false
            },
            columns: [{
                id: 'id',
                text: 'Id',
                width: 75,
                sortable: true,
                dataIndex: 'id',
                hidden: true
            }, {
                text: 'Cmdline',
                flex: 1,
                sortable: true,
                dataIndex: 'cmdline',
                renderer: function(value, metaData, record, row, col, store, gridView) {
                    var color = "#5bcb63";
                    var status = record.get("status");
                    var message;
                    if (status) {
                        message = this.messages.get(status);
                        switch (status) {
                        case "ERROR":
                            color = "#FA4E55";
                            if (message) value = message.format(value);
                            break;
                        case "NOTIFY_PAUSED":
                            color = "#FFB745";
                            if (message) value = message.format(value.replace(": paused", ""));
                            break;
                        default:
                        }
                    }
                    if (!message) value =  this.messages.get("DEFAULT").format(value);
                    metaData.style = 'background:#F7F8FF !important;border-bottom:1px solid {0};border-left:8px solid {0}'.format(color);

                    return value;
                }
            }]
        });

        this.callParent(arguments);
    },
    onDestroy: function() {
        this.callParent(arguments);
        clearInterval(Ext.getStore('TasksPortletStore').autoRefreshProcId);
    },
});
