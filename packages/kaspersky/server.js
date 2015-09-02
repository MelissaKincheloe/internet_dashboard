var ucWords = function(str) {
  // From http://phpjs.org/functions/ucwords/
  return (str + '')
    .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
      return $1.toUpperCase();
    });
};

var countryUrl = function(country, metric) {
  return Settings.dataDir + 'graphic_' + metric.code + '_d_' + country.key + '.xml';
};

var metricsCurrent = function() {
  var country = CountryMetrics.findOne({ key: Settings.defaultCountry.key });
  return _.every(Settings.metrics, function(metric) {
    if (!country.metrics || !country.metrics[metric.code]) {
      return false;
    }

    return moment(country.metrics[metric.code][0].updatedAt)
        .isAfter(moment.utc().subtract(Settings.updateEvery));
  });
};

var countriesExist = function() {
  return CountryMetrics.find().count() > 0;
};

var addCountryData = function(country, data) {
  CountryMetrics.update({ key: country.key }, { $set: data });
};

var parseCountryData = function(response, country, metric) {
  var xmlParser = Npm.require('xml2js');
  var metricKey = 'metrics.' + metric.code;
  var data = {};
  data[metricKey] = [];

  xmlParser.parseString(response.content, { attrkey: 'attr' }, function (error, result) {
    if (error) {
      throw new Error(error);
    }

    _.each(result.root.graphic[0].item, function(item) {
      data[metricKey].push({
        date: Date.parse(item.attr.date + ' +0000'),
        count: parseInt(item.attr[metric.attrName], 10),
        updatedAt: Date.parse(result.root.date[0] + ' +0000')
      });
    });

    addCountryData(country, data);
  });
};

var fetchCountryData = function(country, metric) {
  var options = {
    timeout: 2 * 1000, 
    headers: {
      'User-Agent': 'InternetMonitorDashboard/1.0 KasperskyWidget/0.1'
    }
  };

  HTTP.get(countryUrl(country, metric), options, function(error, response) {
    if (error) {
      if (!error.response || error.response.statusCode !== 404) {
        console.log('Kaspersky: Error fetching ' + countryUrl(country, metric));
        //throw new Error(error);
      }
      //console.log('Kaspersky: ' + metric.name + ' data not available for ' + country.name);
      return false;
    }

    parseCountryData(response, country, metric);
  });
};

var fetchAllCountryData = function() {
  console.log('Kaspersky: Fetching data for all countries');
  CountryMetrics.find().forEach(function(country) {
    _.each(Settings.metrics, function(metric) {
      fetchCountryData(country, metric);
    });
  });
};

var fetchCountries = function() {
  console.log('Kaspersky: Fetching countries');
  var xmlParser = Npm.require('xml2js');

  var xmlData = HTTP.get(Settings.countriesUrl);
  xmlParser.parseString(xmlData.content, { attrkey: 'attr' }, function (error, result) {
    if (error) {
      throw new Error(error);
    }

    var countries = result.root.countries[0].item;
    _.each(countries, function(country) {
      country.attr.name = ucWords(country.attr.name);
      CountryMetrics.insert(country.attr);
    });
  });
};

if (!countriesExist()) {
  fetchCountries();
} else {
  console.log('Kaspersky: Not fetching countries');
}

if (countriesExist() && !metricsCurrent()) {
  fetchAllCountryData();
} else {
  console.log('Kaspersky: Not fetching country metrics');
}

Meteor.setInterval(fetchAllCountryData, Settings.updateEvery.asMilliseconds());

Meteor.publish('kasp_metrics', function() {
  return CountryMetrics.find();
});
