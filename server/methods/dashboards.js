Meteor.methods({
  newDashboard: function() {
    return Dashboards.insert(new Dashboard());
  },
  addWidgetToDashboard: function(dashboardId, widget) {
    Dashboards.update(dashboardId, { $push: { widgets: widget } });
  },
  removeWidgetFromDashboard: function(dashboardId, widgetId) {
    Dashboards.update(dashboardId, { $pull: { widgets: { _id: widgetId } } });
  },
});

