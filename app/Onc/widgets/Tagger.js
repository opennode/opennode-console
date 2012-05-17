Ext.define('Onc.widgets.Tag', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.tag',
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
    extend: 'Ext.panel.Panel',
    alias: 'widget.tagger',
    id: 'tagcontainer',
    ui: '',
    layout: {
        type: 'hbox',
        pack: 'start',
        align: 'middle',
        defaultMargins: {top: 0, right: 2, bottom: 0, left: 0}
    },
    config: {
        tags: [],
        suggestions: [],
    },
    combo: null,
    onTagAdded: Ext.emptyFn,

    initComponent: function() {
        var me = this;
        this.callParent(arguments);

        this.combo = this.createCombo();
        this.load();
        this.add(this.combo);

        Ext.Array.forEach(me.tags, function(item){
            me.addTagComponent(item);
        });

        this.addEvents('tagAdded', 'tagRemoved');
    },

    createCombo: function(){
        var me = this;
        var combo = Ext.create('Ext.form.field.ComboBox', {
            id: 'choose',
            queryMode: 'local',
            displayField: 'val',
            valueField: 'val',
            store: Ext.create('Ext.data.Store', {
                model: 'Onc.widgets.TagModel'
            }),
            width: 100,
            listeners:{
                'select': function(source, eventObject){
                    me.addTag(eventObject[0].get('val'));
                },
                'specialkey': function(source, event, options){
                    picker = source.getPicker();
                    if(event.keyCode === event.ENTER){
                        if(picker.highlightedItem !== undefined)
                            return;
                        picker.clearHighlight();
                        me.addTag(source.getValue());
                    }
                    else if (event.keyCode === event.ESC){
                        picker.clearHighlight();
                    }
                },
                'focus': function(){
                    this.expand();
                },
                'afterrender': function(){ me.combo.getEl().addListener('click', function(){
                    if(!me.combo.isExpanded)
                        me.combo.expand();
                });}
            },
            emptyText: 'type tag',
            autoSelect: false,
            hideTrigger: true
        });
        return combo;
    },

    addTag: function(val){
        var me = this;
        me.tags[me.tags.length] = val;
        me.onTagAdded(val);
        me.fireEvent('tagAdded', me, val);

        me.addTagComponent(val);
        me.load();
        me.combo.reset();
        me.combo.collapse();
        me.combo.store.clearFilter();
    },

    addTagComponent: function(val){
        var me = this;
        var tc = Ext.create('Onc.widgets.Tag', {
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
        me.add(tc);
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