// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Colorthief package defaults to Node.js build with sharp native dependency.
// Redirect colorthief imports to browser-safe builds for mobile and web bundler.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'colorthief') {
    return context.resolveRequest(
      context,
      'colorthief/dist/index.browser.js',
      platform
    );
  }
  if (moduleName === 'colorthief/internals') {
    return context.resolveRequest(
      context,
      'colorthief/dist/internals.browser.js',
      platform
    );
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
