/**
 * @class Onc.portal.PortalPanel
 * @extends Ext.panel.Panel A {@link Ext.panel.Panel Panel} class used for providing drag-drop-enabled portal layouts.
 */
Ext.define('Onc.portal.PortalPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.portalpanel',

    requires: ['Ext.layout.container.Column','Onc.portal.PortalDropZone', 'Onc.portal.PortalColumn'],

    cls: 'x-portal',
    bodyCls: 'x-portal-body',
    defaultType: 'portalcolumn',
    autoScroll: true,

    manageHeight: false,

    initComponent: function() {
        var me = this;

        // Implement a Container beforeLayout call from the layout to this Container
        this.layout = {
            type: 'column'
        };
        this.callParent();

        this.addEvents({
            validatedrop: true,
            beforedragover: true,
            dragover: true,
            beforedrop: true,
            drop: true
        });
    },

     // private
    initEvents: function() {
        this.callParent();
        this.dd = Ext.create('Onc.portal.PortalDropZone', this, this.dropConfig);
    },

    // private
    beforeDestroy: function() {
        if (this.dd) {
            this.dd.unreg();
        }
        this.callParent();
    }
});
