const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname); // <== c'était manquant

// Ajout de configuration supplémentaire pour résoudre les problèmes de résolution
defaultConfig.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => path.join(process.cwd(), `node_modules/${name}`),
  }
);

// Ligne recommandée sur StackOverflow pour Firebase + Expo Go
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
