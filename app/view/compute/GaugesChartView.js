Ext.define('Onc.view.compute.GaugesChartView', {
    extend: 'Ext.window.Window',
    alias: 'widget.gaugeschart',
    hidden: false,
    title: 'Chart',
    modal: true,
    border: false,

    resizable: false,
    layout: 'fit',

    store: null,

    defaults: {
        border: false,
        bodyStyle: 'background: inherit',
        bodyPadding: 4
    },
    _checkIfActive: function() {
        return true;
    },
    minimumTimestamp: 0,

    onMetricsData: function(data) {
        var currentMinimum = this.minimumTimestamp;

        for ( var url in data) {
            var updates = data[url];
            // get type from url
            var type = url.substr(url.lastIndexOf("/") + 1);
            type = type.substr(0, type.lastIndexOf("_"));

            for ( var i = 0; i < updates.length; i += 1) {
                var timestamp = updates[i][0];
                var update = updates[i][1];
                if (parseInt(timestamp) != Number.NaN && timestamp !== undefined) {
                    this.minimumTimestamp = (this.minimumTimestamp == 0 || this.minimumTimestamp > timestamp) ? timestamp : this.minimumTimestamp;
                    var d = {
                        'timestamp': timestamp
                    };
                    // Format data to fit on Chart
                    if (type == "memory") update = update / 1024;
                    if (type == "cpu") update = update * 100;
                    if (type == "network") update = update / 1024;
                    if (type == "diskspace") update = update / 1024;

                    d[type] = update;
                    this.store.add(d);
                }
            }
        }

        if (currentMinimum != this.minimumTimestamp) {
            var chart = Ext.getCmp("gaugesChart");
            chart.axes.get(1).minimum = this.minimumTimestamp;
            chart.redraw();
        }
    },

    compute: null,

    loadOldData: function() {
        Onc.core.hub.Hub.getFromPast(0, this.urls, this.onMetricsData.bind(this));
    },
    clearData: function() {
        this.store.removeAll();
        this.minimumTimestamp=0;
    },

    initComponent: function() {
        var url = this.compute.get('url');
        this.urls = [url + 'metrics/diskspace_usage', url + 'metrics/cpu_usage', url + 'metrics/memory_usage', url + 'metrics/network_usage']
        Onc.core.hub.Hub.subscribe(this.onMetricsData.bind(this), this.urls, 'chart', this._checkIfActive.bind(this));

        this.items = [{
            xtype: 'chart',
            id: 'gaugesChart',
            minWidth: 800,
            minHeight: 600,
            style: 'background:#fff',
            animate: false,
            store: this.store,
            legend: {
                position: 'right'
            },
            axes: [{
                type: 'Numeric',
                minimum: 0,
                position: 'left',
                fields: ['cpu', 'memory', 'network', 'diskspace'],
                title: 'consumption',
                minorTickSteps: 1,
                grid: {
                    odd: {
                        opacity: 1,
                        fill: '#ddd',
                        stroke: '#bbb',
                        'stroke-width': 0.5
                    }
                }
            }, {
                type: 'Numeric',
                position: 'bottom',
                fields: ['timestamp'],
                title: 'Time',

                label: {
                    font: '10px Arial',
                    renderer: function(timestamp) {
                        var date = new Date(timestamp)
                        return Ext.Date.format(date, 'Y-m-d G:i:s');
                    }
                }
            }],
            series: [{
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
                xField: 'timestamp',
                yField: 'cpu',
                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0
                },
                tips: {
                    trackMouse: true,

                    renderer: function(storeItem, item) {
                        var date = new Date(storeItem.get('timestamp'));
                        this.setTitle(Ext.Date.format(date, 'Y-m-d G:i:s'));
                        this.update(storeItem.get('cpu'));
                    }
                }
            }, {
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
                xField: 'timestamp',
                yField: 'memory',

                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0
                },
                tips: {
                    trackMouse: true,
                    renderer: function(storeItem, item) {
                        var date = new Date(storeItem.get('timestamp'));
                        this.setTitle(Ext.Date.format(date, 'Y-m-d G:i:s'));
                        this.update(storeItem.get('memory') + " GB");
                    }
                }
            }, {
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
                xField: 'timestamp',
                yField: 'network',

                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0
                },
                tips: {
                    width: 150,
                    trackMouse: true,
                    renderer: function(storeItem, item) {
                        var date = new Date(storeItem.get('timestamp'));
                        this.setTitle(Ext.Date.format(date, 'Y-m-d G:i:s'));
                        this.update(storeItem.get('network') + "");
                    }
                }
            }, {
                type: 'line',
                highlight: {
                    size: 7,
                    radius: 7
                },
                axis: 'left',
                xField: 'timestamp',
                yField: 'diskspace',

                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0
                },
                tips: {
                    width: 150,
                    trackMouse: true,
                    renderer: function(storeItem, item) {
                        var date = new Date(storeItem.get('timestamp'));
                        this.setTitle(Ext.Date.format(date, 'Y-m-d G:i:s'));
                        this.update(storeItem.get('diskspace') + "");
                    }
                }
            }]
        }];

        this.tbar = [{
            text: 'Clear',
            handler: function() {
                this.clearData();
            }.bind(this)
        }, {
            text: 'Old Data',
            handler: function() {
                this.loadOldData();
            }.bind(this)
        }], this.callParent(arguments);
    }
});
