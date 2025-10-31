const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');
const packagePath = path.resolve(root, 'package');

/**
 * Metro configuration for monorepo
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [root],

  resolver: {
    // Exclude package's node_modules and build directories
    blockList: [
      /package\/node_modules\/.*/,
      /package\/android\/build\/.*/,
      /package\/ios\/build\/.*/,
    ].map((re) => new RegExp(re)),

    // Tell Metro where to find node_modules
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
    ],

    // Use source code directly for react-native-nitro-cookies
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react-native-nitro-cookies') {
        return {
          filePath: path.join(packagePath, 'src/index.tsx'),
          type: 'sourceFile',
        };
      }

      // Let Metro handle everything else
      return context.resolveRequest(context, moduleName, platform);
    },
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
