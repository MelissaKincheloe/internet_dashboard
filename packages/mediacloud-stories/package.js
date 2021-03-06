Package.describe({
  name: 'mediacloud-stories',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use(['widget', 'mongo', 'underscore', 'mediacloud-data', 'momentjs:moment']);
  api.use(['templating'], 'client');

  api.addFiles([ 'mediacloud_stories.js' ]);

  api.addFiles([
    'client/info.html',
    'client/widget.html',
    'client/widget.js',
    'client/widget.css',
    'client/settings.html',
    'client/settings.js'
    ], 'client');

  api.export('MediaCloudStories');
});
