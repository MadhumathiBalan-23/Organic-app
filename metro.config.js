const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname, path.resolve(__dirname, "agriapp")];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "agriapp/node_modules"),
  path.resolve(__dirname, "node_modules"),
];

module.exports = withNativeWind(config, {
  input: "./agriapp/global.css",
  configPath: "./agriapp/tailwind.config.js",
});
