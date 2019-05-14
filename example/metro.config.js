/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist'); // eslint-disable-line
const reactNativeLib = path.resolve(__dirname, '..');

module.exports = {
  watchFolders: [path.resolve(__dirname, 'node_modules'), reactNativeLib],
  resolver: {
    blacklistRE: blacklist([
      new RegExp(`${reactNativeLib}/node_modules/react-native/.*`),
      new RegExp(`${__dirname}/node_modules/react-native-msal-client/node_modules/.*`),
      new RegExp(`${__dirname}/node_modules/react-native-msal-client/example/.*`),
    ]),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
