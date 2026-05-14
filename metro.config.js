// metro.config.js
// Registers .docx (and other Office formats) as binary assets so Expo can
// bundle and access them via Asset.fromModule() / require().
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add docx (and other Office/binary formats) to the asset extensions list
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'docx',
  'pdf',
  'xlsx',
  'pptx',
];

module.exports = config;