const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// The monorepo root
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Enable hierarchical lookup (CRITICAL for finding nested node_modules in pnpm)
config.resolver.disableHierarchicalLookup = false;

// 4. Enable package exports (Disabled because it breaks htmlparser2/entities resolution)
config.resolver.unstable_enablePackageExports = false;

// 5. Enable symlinks (CRITICAL for pnpm workspaces)
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
