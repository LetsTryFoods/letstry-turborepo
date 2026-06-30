// Custom Expo config plugin to fix the conflict between:
//   - use_frameworks! :linkage => :static  (required for Firebase Swift pods)
//   - @react-native-firebase (RNFBApp)     (breaks with non-modular header error)
//
// Fix: Add CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES in post_install.
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const FIX_MARKER = 'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES';

const POST_INSTALL_FIX = `
  # Fix: Allow @react-native-firebase (RNFBApp) to include React-Core headers
  # when use_frameworks! :linkage => :static is enabled.
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
  end`;

function withFirebaseFix(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );

      let podfile = fs.readFileSync(podfilePath, 'utf8');

      if (!podfile.includes(FIX_MARKER)) {
        if (podfile.includes('post_install do |installer|')) {
          // Inject inside existing post_install block
          podfile = podfile.replace(
            'post_install do |installer|',
            `post_install do |installer|\n${POST_INSTALL_FIX}`
          );
        } else {
          // Add a new post_install block at the end
          podfile += `\npost_install do |installer|\n${POST_INSTALL_FIX}\nend\n`;
        }
        fs.writeFileSync(podfilePath, podfile);
        console.log('✅ Added CLANG_ALLOW_NON_MODULAR_INCLUDES fix to Podfile post_install');
      }

      return config;
    },
  ]);
}

module.exports = withFirebaseFix;
