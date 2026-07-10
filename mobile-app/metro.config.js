const { getDefaultConfig } = require("@expo/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.resolver.blockList = exclusionList([
  /web-kkn\/.*/,
  /node_modules\/.*\/node_modules\/.*/,
]);

module.exports = config;
