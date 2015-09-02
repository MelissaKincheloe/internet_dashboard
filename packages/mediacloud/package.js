Package.describe({
  name: 'mediacloud',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.2');

  api.use(['widget', 'mongo', 'underscore', 'mediacloud-data']);
  api.use(['templating', 'tagcloud'], 'client');

  api.addFiles([ 'mediacloud.js' ]);

  api.addFiles([
    'client/widget.html',
    'client/widget.js',
    'client/widget.css',
    'client/settings.html',
    'client/settings.js'
    ], 'client');

  api.export('MediaCloud');
});
