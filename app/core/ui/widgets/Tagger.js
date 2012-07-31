Ext.define('Onc.core.ui.widgets.TagBox', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.tag',
    cls: 'tagbox',
    width: 80,
    closable: true,
});


Ext.define('Onc.core.ui.widgets.TagModel', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',  type: 'string'},
        {name: 'val',  type: 'string'}
    ]}
);


Ext.define('Onc.core.ui.widgets.Tagger', {
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
        // prefix to be removed before displaying tags and added when typing tags
        prefix: null,
    },
    combo: null,
    tagcontainer: null,
    onTagAdded: Ext.emptyFn,

    items: [{
        itemId: 'choose',
        xtype: 'combo',
        queryMode: 'local',
        displayField: 'val',
        valueField: 'id',
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

        this.combo.store = Ext.create('Ext.data.Store', {
            model: 'Onc.core.ui.widgets.TagModel'
        });

        this.combo.on({
            'select': function(source, eventObject){
                this.addTag(eventObject[0].get('id'));
            },
            'specialkey': function(source, event, options){
                picker = source.getPicker();
                if(event.keyCode === event.ENTER){
                    if(picker.highlightedItem !== undefined)
                        return;
                    if(this.addTag(this._getFullTagName(source.getValue())))
                        picker.clearHighlight();
                }
                else if (event.keyCode === event.ESC){
                    picker.clearHighlight();
                }
            },
            'focus': function(){
                if(!this.isDisabled())
                    this.combo.expand();
            },
            'afterrender': function(){ this.getEl().addListener('click', function(){
                if(!this.isDisabled())
                    this.combo.expand();
            }, this);},
            scope: this
        });

        this._load();
        Ext.Array.forEach(this.tags, function(item){
            this._addTagComponent(item);
        }, this);
        this.addEvents('tagAdded', 'tagRemoved');
    },

    addTag: function(val){
        if(Ext.Array.contains(this.tags, val))
            return false;
        this.tags[this.tags.length] = val;
        this.onTagAdded(val);
        this.fireEvent('tagAdded', this, val);

        this._addTagComponent(val);
        this._load();
        this.combo.reset();
        this.combo.collapse();
        this.combo.store.clearFilter();
        return true;
    },

    _addTagComponent: function(val){
        var tc = Ext.create('Onc.core.ui.widgets.TagBox', {
            title: this._getDisplayTitle(val),
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
        this._load();
    },

    _load: function(){
        var displayedTags = Ext.Array.difference(this.suggestions, this.tags);
        var data = [];
        Ext.Array.forEach(displayedTags, function(item, index){
            data[index] = Ext.create('Onc.core.ui.widgets.TagModel', {id: item, val: this._getDisplayTitle(item)});
        }, this);
        this.combo.store.loadRecords(data, {addRecords: false});
    },

    cloneTags: function(){
        return Ext.clone(this.tags);
    },

    _getDisplayTitle: function(val){
        return this.prefix ? val.replace(this.prefix, '') : val;
    },

    _getFullTagName: function(val){
        return this.prefix && val.indexOf(this.prefix) !== 0 ? this.prefix + val : val;
    }
});
