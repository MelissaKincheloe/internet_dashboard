Settings = {
  numRanks: 7
};

AccessWidget = function(doc) {
  Widget.call(this, doc);

  if (this.data.isEmpty() && Meteor.isClient) {
    var self = this;
    Meteor.subscribe('imon_countries', function() {
      self.data.set({
        country: IMonCountries.findOne({ code: 'usa' })
      });
    });
  }
};

AccessWidget.prototype = Object.create(Widget.prototype);
AccessWidget.prototype.constructor = AccessIndex;

_.extend(AccessWidget.prototype, {
  setCountry: function(code) {
    var widget = this;
    CountryInfo.byCode(code, function(country) {
      var code = country.alpha3.toLowerCase();
      country = IMonCountries.findOne({ code: code });
      if (country) {
        widget.data.set({ country: country });
      }
    });
  }
});

AccessIndex = {
  widget: {
    name: 'IM Access Index',
    description: 'Shows the Internet Monitor Access rank and score for countries',
    url: 'https://thenetmonitor.org/faq/a-hackable-access-index',
    dimensions: { width: 2, height: 2 },
    category: 'access',
    constructor: AccessWidget
  },
  org: {
    name: 'Internet Monitor',
    shortName: 'IM',
    url: 'https://thenetmonitor.org'
  }
};
