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
    itemId: 'tagger',
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
        itemId: 'tagcontainer',
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
        this.callParent(arguments);

        this.combo = this.child('#choose');
        this.tagcontainer = this.child('#tagcontainer');

        this.combo.on({
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
            scope: this
        });

        this.load();
        Ext.Array.forEach(this.tags, function(item){
            this.addTagComponent(item);
        }, this);
        this.addEvents('tagAdded', 'tagRemoved');
    },

    addTag: function(val){
        if(Ext.Array.contains(this.tags, val))
            return false;
        this.tags[this.tags.length] = val;
        this.onTagAdded(val);
        this.fireEvent('tagAdded', this, val);

        this.addTagComponent(val);
        this.load();
        this.combo.reset();
        this.combo.collapse();
        this.combo.store.clearFilter();
        return true;
    },

    addTagComponent: function(val){
        var tc = Ext.create('Onc.widgets.TagBox', {
            title: val,
            listeners: { 'close': function() {this.removeTag(val);}.bind(this) }
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
        this.tagcontainer.add(tc);
    },

    removeTag: function(val){
        Ext.Array.remove(this.tags, val);
        this.fireEvent('tagRemoved', this, val);
        this.load();
    },

    load: function(){
        var displayedTags = Ext.Array.difference(this.suggestions, this.tags);
        var data = [];
        Ext.Array.forEach(displayedTags, function(item, index){
            data[index] = Ext.create('Onc.widgets.TagModel', {val: item});
        });
        this.combo.store.loadRecords(data, {addRecords: false});
    },

    cloneTags: function(){
        return Ext.clone(this.tags);
    }
});
