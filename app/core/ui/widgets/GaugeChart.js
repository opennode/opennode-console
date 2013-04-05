Ext.define('Onc.core.ui.widgets.GaugeChart', {
    extend: 'Ext.Panel',
    alias: 'widget.gaugechart',

    layout: 'fit',
    store: Ext.create('Ext.data.JsonStore', {
        fields: ['timestamp', 'co0_c', 'co1_c'],
        data: [],
        sorters: ['timestamp']
    }),

    minimumTimestamp: 0,
    urls: [],

    // used when usePercentValues=true
    maxValuesUrlAsKey: new Ext.util.HashMap(),

    // used when usePercentValues=false
    maxValuesTypeAsKey: new Ext.util.HashMap(),

    selectedComputes: [],
    selectedMetrics: ["cpu", "memory"],

    // use percent values(max=assigned max) or dynamic value (max=max value received)
    usePercentValues: true,

    // Possible types are : circle line square triangle diamond cross plus arrow drop
    metricLineMarkerType: {
        "cpu": "circle",
        "diskspace": "cross",
        "network": "triangle",
        "memory": "plus"
    },

    metricUrlsAsId: new Ext.util.HashMap(),

    /**
     * @param url
     * @returns String Short id for Serie
     */
    _getMetricUrlAsId: function(url) {
        var res = url.split('/');
        var typeLong = url.split('/')[res.length - 1];
        var type = typeLong;// .substr(0, 1);
        if (!this.metricUrlsAsId.containsKey(url)) this.metricUrlsAsId.add(url, "co" + this.metricUrlsAsId.length + "_" + type);
        return this.metricUrlsAsId.get(url);
    },

    _getFieldsFromUrls: function(urls) {
        var fields = [];
        for ( var i = 0; i < urls.length; i++) {
            fields.push(this._getMetricUrlAsId(urls[i]));
        }
        return fields;
    },

    _getComputeFromMetricId: function(id) {
        var url = "";
        this.metricUrlsAsId.each(function(key, value, length) {
            if (id === value) url = key;
        });
        var res = url.split('/');
        var computeId = url.split('/')[res.length - 3];

        return Ext.getStore("GaugesChartComputesStore").getById(computeId);
    },

    _getTypeFromMetricId: function(id) {
        return id.split('_')[1];
    },

    _getTypeFromUrl: function(url) {
        var res = url.split('/');
        var typeLong = url.split('/')[res.length - 1];
        return typeLong.substr(0, typeLong.lastIndexOf("_"));
    },

    _getComputeFromUrl: function(url) {
        var res = url.split('/');
        var computeId = url.split('/')[res.length - 3];

        return Ext.getStore("GaugesChartComputesStore").getById(computeId);
    },

    _updateMaxValuesUrlAsKey: function() {
        for ( var i = 0; i < this.urls.length; i++) {
            var url = this.urls[i];
            var type = this._getTypeFromUrl(url);
            var compute = this._getComputeFromUrl(url);
            if (!this.maxValuesUrlAsKey.containsKey(url)) {
                var maxValue = 0;
                if (type === "diskspace")
                    maxValue = compute.get(type)['total']
                else if (type === "cpu")
                    maxValue = compute.get('num_cores') * 1.0;
                else
                    maxValue = compute.get(type);

                this.maxValuesUrlAsKey.add(url, maxValue);
            }
        }
    },
    /**
     * Updates metrics maximum, when usePercentValues=false
     * 
     * @param type
     * @param value
     */
    _updateMetricsMax: function(type, value) {
        if (!this.maxValuesTypeAsKey.containsKey(type)) this.maxValuesTypeAsKey.add(type, value);
        var currentValue = this.maxValuesTypeAsKey.get(type)
        if (currentValue < value) {
            this.maxValuesTypeAsKey.replace(type, value);
            return value;
        }
        return currentValue;
    },

    _findSeriesByField: function(chart, yField) {
        for ( var i = 0; i < chart.series.items.length; i++) {
            if (chart.series.items[i].yField == yField) return chart.series.items[i]
        }
        return null;
    },

    updateStoreFields: function() {
        var me = this;
        var fields = this._getFieldsFromUrls(this.urls);
        delete this.store;
        this.store = Ext.create('Ext.data.JsonStore', {
            fields: fields.concat(['timestamp']),
            data: [],
            sorters: ['timestamp'],
            listeners: {
                add: function(store, records, index, eOpts) {
                    // var now = new Date();
                    var MS_PER_MINUTE = 60000;
                    var keepMinutes = 5;
                    // This is correct but server time may be wrong
                    // var keepFromDate = now.getTime() - keepMinutes * MS_PER_MINUTE;

                    // Lets get max time and subtract from that
                    var keepFromDate = (this.store.last()) ? this.store.last().get("timestamp") - keepMinutes * MS_PER_MINUTE : 0;

                    // Lets move minimum mark on chart
                    this.minimumTimestamp = keepFromDate;

                    var recordsToRemove = [];
                    this.store.each(function(record) {
                        if (record.get("timestamp") < keepFromDate)
                            recordsToRemove.push(record);
                        else
                            return;

                    });

                    if (recordsToRemove.length > 0) {
                        this.store.remove(recordsToRemove)
                    }
                }.bind(this)
            },
        });
        var chart = this.child('chart');
        chart.bindStore(this.store, true);
        chart.axes.get(0).fields = fields;

        // TODO:Should remove unused serie? For now we remove only data.
        for ( var i = 0; i < fields.length; i++) {
            var compute = this._getComputeFromMetricId(fields[i]);
            var fieldType = this._getTypeFromMetricId(fields[i]);
            if (!this._findSeriesByField(chart, fields[i])) {// Do not add when it is already there
                var serie = {
                    hostname: compute.get("hostname"),
                    computeId: compute.get("id"),
                    fieldType: Ext.String.capitalize(fieldType),
                    type: 'line',
                    axis: 'left',
                    xField: 'timestamp',
                    yField: fields[i],
                    showMarkers: true,
                    markerConfig: {
                        type: this.metricLineMarkerType[fieldType],
                        size: 1,
                        radius: 3,
                        'stroke-width': 0
                    },
                    listeners: {
                        itemclick: function(evtObj) {
                            var compute = Ext.getStore("GaugesChartComputesStore").getById(evtObj.series.computeId);
                            Onc.core.EventBus.fireEvent('openGaugesChart', compute);
                        }.bind(this)
                    },
                    tips: {
                        width: 130,
                        trackMouse: true,
                        renderer: function(storeItem, item) {
                            var date = new Date(storeItem.get('timestamp'));
                            this.setTitle(Ext.Date.format(date, 'Y-m-d G:i:s'));
                            var loadValue = "";
                            if (me.usePercentValues) {
                                loadValue = storeItem.get(item.series.yField) + "%";
                            } else {
                                if (item.series.fieldType === "Cpu")
                                    loadValue = (storeItem.get(item.series.yField)).round(1) + "%";
                                else if (item.series.fieldType === "Network")
                                    loadValue = (storeItem.get(item.series.yField) / 1024).round(3) + " kb/sec";
                                else
                                    loadValue = (storeItem.get(item.series.yField) / 1024).round(3) + " GB";
                            }
                            this.update(item.series.hostname + "<br/>" + item.series.fieldType + " load:" + loadValue);
                        }
                    }
                };
                chart.series.add(serie);
            }
        }
        // TODO: Should redraw only when removing serie
        chart.redraw();
    },

    onMetricsData: function(data) {
        var currentMinimum = this.minimumTimestamp;
        for ( var url in data) {
            var updates = data[url];
            var urlAsId = this._getMetricUrlAsId(url);
            var type = this._getTypeFromUrl(url);
            var maxValue = 100;
            for ( var i = 0; i < updates.length; i += 1) {
                var timestamp = updates[i][0];
                var updateValue = updates[i][1];
                if (parseInt(timestamp) != Number.NaN && timestamp !== undefined) {
                    this.minimumTimestamp = (this.minimumTimestamp == 0 || this.minimumTimestamp > timestamp) ? timestamp : this.minimumTimestamp;
                    var d = {
                        'timestamp': timestamp
                    };

                    if (this.usePercentValues)
                        maxValue = this.maxValuesUrlAsKey.get(url);
                    else
                        maxValue = this._updateMetricsMax(type, updateValue);
                    // Format data to fit on Chart
                    var ratio = (updateValue / maxValue).round(4);
                    ratio = (isNaN(ratio) ? 0 : ratio);
                    var ratioPercentage = (ratio * 100).round(2);

                    d[urlAsId] = ratioPercentage;

                    this.store.add(d);
                }
            }
        }
        // when loading data from past, minimum must change
        if (currentMinimum != this.minimumTimestamp) {
            var chart = this.child('chart');
            chart.axes.get(1).minimum = this.minimumTimestamp;
            chart.redraw();
        }

    },

    loadOldData: function() {
        Onc.core.hub.Hub.getFromPast(0, this.urls, this.onMetricsData.bind(this));
    },

    clearData: function() {
        this.store.removeAll();
        this.minimumTimestamp = 0;
        this.maxValuesUrlAsKey = new Ext.util.HashMap();

        this.maxValuesTypeAsKey = new Ext.util.HashMap();
    },

    addMetric: function(metric) {
        this.selectedMetrics = Ext.Array.unique(this.selectedMetrics.concat([metric]));
        this.setAndLoadComputes(this.selectedComputes);
    },
    removeMetric: function(metric) {
        this.selectedMetrics.remove(metric);
        this.setAndLoadComputes(this.selectedComputes);
    },

    /**
     * Load Array of computes and load them on chart
     * 
     * @param computes
     */
    setAndLoadComputes: function(computes) {
        var urls = [];
        this.selectedComputes = computes;

        for ( var i = 0; i < computes.length; i++) {
            var compute = computes[i]
            for ( var j = 0; j < this.selectedMetrics.length; j++) {
                var metric = this.selectedMetrics[j]
                urls.push(compute.get('url') + "metrics/{0}_usage".format(metric));
            }
        }

        this.urls = urls;
        this.updateStoreFields();
        if (this.usePercentValues) this._updateMaxValuesUrlAsKey();

        this.subscribeNewUrls();
        this.loadOldData();
    },

    subscribeNewUrls: function() {
        Onc.core.hub.Hub.subscribe(this.onMetricsData.bind(this), this.urls, 'chart', function() {
            return true;
        });
    },

    initComponent: function() {
        var me = this;
        this.items = [{
            xtype: 'chart',
            name: 'gaugesChart',
            minWidth: 200,
            minHeight: 200,
            // layout: 'fit',
            style: 'background:#fff',
            animate: false,
            store: this.store,
            axes: [{
                type: 'Numeric',
                minimum: 0,
                maximum: 100,
                // hidden: true,
                position: 'left',
                fields: [],
                dashSize: 1,
                label: {
                    font: '8px Arial',
                    renderer: function(p) {
                        if (me.usePercentValues)
                            return p.round(2) + "%";
                        else
                            return "";
                    }
                },
                grid: {
                    odd: {
                        opacity: 1,
                        fill: '#ddd',
                        stroke: '#bbb',
                        'stroke-width': 0.5
                    }
                },
            }, {
                type: 'Numeric',
                position: 'bottom',
                fields: ['timestamp'],
                hidden: true,
                label: {
                    font: '10px Arial',
                    renderer: function(timestamp) {
                        var date = new Date(timestamp)
                        return Ext.Date.format(date, 'Y-m-d G:i:s');
                    }
                }
            }],
            series: []
        }];

        this.callParent(arguments);
    }
});
