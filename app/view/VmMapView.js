Ext.define('Onc.view.VmMapView', {
    extend: 'Ext.grid.View',
    alias: 'widget.vmmapview',

    collectData: function(records, startIndex) {
        var pms = [];
        var i = 0;
        var len = records.length;
        var record;

        while (i < len) {
            record = records[i];
            if (record.getChild('vms')) {
                pms[pms.length] = record;
            }
            i++;
        }

        return this.callParent([pms, startIndex]);
    }
});
