const path = require('path');
const pkg = require('../package/package.json');

module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: true,
    },
  },
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '../package'),
      platforms: {
        // Retained from the codegen workaround; RN 0.85.3 now accepts missing platform entries.
        ios: {},
        android: {},
      },
    },
  },
};
