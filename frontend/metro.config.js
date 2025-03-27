// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add any additional configurations here
// Handle native modules for different platforms
config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(',').map(ext => ext.trim()), ...config.resolver.sourceExts]
  : config.resolver.sourceExts;

// Ensure proper handling of symlinks
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Make sure web modules are included when bundling
config.resolver.assetExts = [...config.resolver.assetExts, 'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
  path: path.resolve(__dirname, 'node_modules/path-browserify'),
};

module.exports = config; 