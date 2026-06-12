const { getDefaultConfig } = require("expo/metro-config");
const exclusionList =
  require("metro-config/private/defaults/exclusionList").default;
const { withNativeWind } = require("nativewind/metro");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const projectRoot = escapeRegExp(__dirname);
const config = getDefaultConfig(__dirname);

config.resolver.blockList = exclusionList([
  new RegExp(`${projectRoot}[/\\\\]dist[/\\\\].*`),
  new RegExp(`${projectRoot}[/\\\\]functions[/\\\\].*`),
]);

module.exports = withNativeWind(config, { input: "./global.css" });
