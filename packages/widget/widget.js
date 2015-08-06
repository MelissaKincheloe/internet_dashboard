Widget = function(doc) {
  doc = doc || {};
  _.extend(this, doc);

  this.data = doc.data ? new WidgetData(doc.data) : new WidgetData();
  this.data.widget = this;

  this.package = WidgetPackages.findOne({ packageName: this.packageName });
};

_.extend(Widget.prototype, {
  toJSON: function() {
    var widget = _.pick(this, [
      '_id', 'packageName', 'dashboardId', 'height', 'width',
      'resize', 'position', 'data'
    ]);
    widget.data = this.data.toJSON();
    return widget;
  },
  dashboard: function() {
    return Dashboards.findOne(this.dashboardId);
  },
  componentId: function(component) {
    component = component || 'widget';
    return this.packageName + '-' + this._id + '-' + component;
  },
});

// Static methods
_.extend(Widget, {
  construct: function(doc) {
    var package = WidgetPackages.findOne({ packageName: doc.packageName });
    var widgetInfo = Package[package.packageName][package.exportedVar].widget;

    if ((_.isUndefined(doc.width) || _.isUndefined(doc.height)) &&
        widgetInfo.dimensions) {
      doc.width = widgetInfo.dimensions.width;
      doc.height = widgetInfo.dimensions.height;
    }

    if (_.isUndefined(doc.resize) && widgetInfo.resize) {
      doc.resize = widgetInfo.resize;
    }

    doc = Widgets.simpleSchema().clean(doc);
    return new widgetInfo.constructor(doc);
  },
  Settings: {
    titleBar: { height: 20 }
  }
});

// Collection
Widgets = new Mongo.Collection('widgets', {
  transform: function(doc) { return Widget.construct(doc); }
});

Widgets.attachSchema(new SimpleSchema({
  packageName: {
    type: String,
  },
  dashboardId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  width: {
    type: Number,
    allowedValues: [1, 2, 3, 4, 5],
  },
  height: {
    type: Number,
    allowedValues: [1, 2, 3, 4, 5],
  },
  position: {
    type: Object,
    optional: true
  },
  'position.row': {
    type: Number,
    min: 0
  },
  'position.col': {
    type: Number,
    min: 0
  },
  'resize': {
    type: Object,
    optional: true
  },
  'resize.mode': {
    type: String,
    defaultValue: 'scale',
    optional: true,
    allowedValues: ['scale', 'reflow']
  },
  'resize.constraints': {
    type: Object,
    optional: true,
  },
  'resize.constraints.width': {
    type: Object,
    optional: true,
  },
  'resize.constraints.width.min': {
    type: Number,
    defaultValue: 1,
    allowedValues: [1, 2, 3, 4, 5],
    optional: true,
  },
  'resize.constraints.width.max': {
    type: Number,
    defaultValue: 5,
    allowedValues: [1, 2, 3, 4, 5],
    optional: true,
  },
  'resize.constraints.height': {
    type: Object,
    optional: true,
  },
  'resize.constraints.height.min': {
    type: Number,
    defaultValue: 1,
    allowedValues: [1, 2, 3, 4, 5],
    optional: true,
  },
  'resize.constraints.height.max': {
    type: Number,
    defaultValue: 5,
    allowedValues: [1, 2, 3, 4, 5],
    optional: true,
  },
  data: {
    type: Object,
    blackbox: true
  }
}));

Widgets.updatePositions = function(positions) {
  if (Dashboards.findOne().editable()) {
    Meteor.call('updateWidgetPositions', positions);
  }
};
