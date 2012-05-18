Ext.define('Onc.widgets.TagBox', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.tag',
    cls: 'tagbox',
    width: 80,
    closable: true,
});


Ext.define('Onc.widgets.TagModel', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'val',  type: 'string'}
    ]}
);


Ext.define('Onc.widgets.Tagger', {
    extend: 'Ext.container.Container',
    alias: 'widget.tagger',
    id: 'tagger',
    cls: 'tagger',
    layout: {
        type: 'hbox',
        pack: 'start',
        align: 'top',
    },
    config: {
        tags: [],
        suggestions: [],
    },
    combo: null,
    tagcontainer: null,
    onTagAdded: Ext.emptyFn,

    items: [{
        id: 'choose',
        itemId: 'choose',
        xtype: 'combo',
        queryMode: 'local',
        displayField: 'val',
        valueField: 'val',
        store: Ext.create('Ext.data.Store', {
            model: 'Onc.widgets.TagModel'
        }),
        width: 100,
        margin: 1,
        emptyText: 'type tag',
        autoSelect: false,
        hideTrigger: true
    }, {
        id: 'tagcontainer',
        xtype: 'container',
        cls: 'tagcontainer',
        flex: 1,
        layout: {
            type: 'hbox',
            pack: 'start',
            align: 'top',
            defaultMargins: {top: 0, right: 2, bottom: 16, left: 0},
        },
    }],


    initComponent: function() {
        var me = this;
        me.callParent(arguments);

        me.combo = me.child('#choose');
        me.tagcontainer = me.child('#tagcontainer');
        me.combo.on({
            'select': function(source, eventObject){
                this.addTag(eventObject[0].get('val'));
            },
            'specialkey': function(source, event, options){
                picker = source.getPicker();
                if(event.keyCode === event.ENTER){
                    if(picker.highlightedItem !== undefined)
                        return;
                    if(this.addTag(source.getValue()))
                        picker.clearHighlight();
                }
                else if (event.keyCode === event.ESC){
                    picker.clearHighlight();
                }
            },
            'focus': function(){
                this.combo.expand();
            },
            'afterrender': function(){ this.getEl().addListener('click', function(){
                    this.combo.expand();
            }, this);},
            scope: me
        });

        me.load();
        Ext.Array.forEach(me.tags, function(item){
            me.addTagComponent(item);
        });
        me.addEvents('tagAdded', 'tagRemoved');
    },

    addTag: function(val){
        var me = this;
        if(Ext.Array.contains(me.tags, val))
            return false;
        me.tags[me.tags.length] = val;
        me.onTagAdded(val);
        me.fireEvent('tagAdded', me, val);

        me.addTagComponent(val);
        me.load();
        me.combo.reset();
        me.combo.collapse();
        me.combo.store.clearFilter();
        return true;
    },

    addTagComponent: function(val){
        var me = this;
        var tc = Ext.create('Onc.widgets.TagBox', {
            title: val,
            listeners: { 'close': function() {me.removeTag(val);} }
        });

        tc.on('afterrender', function(){
            tc.tools.close.hide();
            tc.getEl().addListener('mouseenter', function(){
                tc.tools.close.show();
            });
            tc.getEl().addListener('mouseleave', function(){
                tc.tools.close.hide();
            });
        });
        me.tagcontainer.add(tc);
    },

    removeTag: function(val){
        var me = this;
        Ext.Array.remove(me.tags, val);
        me.fireEvent('tagRemoved', me, val);
        me.load();
    },

    load: function(){
        var displayedTags = Ext.Array.difference(this.suggestions, this.tags);
        var data = [];
        Ext.Array.forEach(displayedTags, function(item, index){
            data[index] = Ext.create('Onc.widgets.TagModel', {val: item});
        });
        this.combo.store.loadRecords(data, {addRecords: false});
    },
});