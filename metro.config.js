const { getDefaultConfig } = require('@expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs','ts','tsx');
defaultConfig.resolver.assetExts.push('lottie');
module.exports = defaultConfig;
