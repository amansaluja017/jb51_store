// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const path = require('path');

// Colorthief package defaults to Node.js build with sharp native dependency.
// Redirect colorthief imports directly to browser-safe source files to prevent subpath export warnings.
let colorthiefDistDir;
try {
  colorthiefDistDir = path.dirname(
    require.resolve('colorthief', { paths: [__dirname] })
  );
} catch {
  colorthiefDistDir = null;
}

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'colorthief' && colorthiefDistDir) {
    return {
      type: 'sourceFile',
      filePath: path.join(colorthiefDistDir, 'index.browser.js'),
    };
  }
  if (moduleName === 'colorthief/internals' && colorthiefDistDir) {
    return {
      type: 'sourceFile',
      filePath: path.join(colorthiefDistDir, 'internals.browser.js'),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
