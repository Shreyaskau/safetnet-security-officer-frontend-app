const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const allowListRegex = '@babel/core|@babel/generator|@babel/parser|@babel/preset-modules|@expo/vector-icons|@firebase/ai|@firebase/analytics|@firebase/app|@firebase/app-check|@firebase/app-compat|@firebase/auth|@firebase/auth-compat|@firebase/component|@firebase/database|@firebase/database-compat|@firebase/data-connect|@firebase/firestore|@firebase/firestore-compat|@firebase/functions|@firebase/messaging|@firebase/performance|@firebase/remote-config|@firebase/storage|@firebase/util|@grpc/grpc-js|@jest/fake-timers|@jridgewell/gen-mapping|@react-native/babel-preset|@react-native/community-cli-plugin|@react-native/debugger-frontend|@react-native/dev-middleware|@react-native/metro-config|@react-native/virtualized-lists|@react-native-async-storage/async-storage|@react-native-community/cli|@react-native-community/geolocation|@react-native-firebase/app|@react-native-firebase/messaging|@react-native-material/core|@react-navigation/bottom-tabs|@react-navigation/core|@react-navigation/drawer|@react-navigation/elements|@react-navigation/material-top-tabs|@react-navigation/native|@react-navigation/native-stack|@react-navigation/routers|@react-navigation/stack|@reduxjs/toolkit|@standard-schema/utils|@types/node|acorn|envinfo|escape-string-regexp|firebase|flow-parser|hermes-estree|hermes-parser|immer|jest-environment-node|jest-message-util|jest-util|jest-validate|jest-worker|metro|metro-babel-transformer|metro-config|metro-file-map|metro-resolver|metro-runtime|metro-source-map|metro-symbolicate|metro-transform-plugins|metro-transform-worker|minimatch|moment|picomatch|pretty-format|react-devtools-core|react-native|react-native-elements|react-native-gesture-handler|react-native-maps|react-native-material-icons|react-native-pager-view|react-native-paper|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-tab-view|react-native-toast-message|react-native-vector-icons|react-native-worklets|react-redux|recast|reselect|stacktrace-parser|stack-utils|terser|web-vitals|yaml';

const config = {
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    unstable_allowRequireContext: true,
  },
  resolver: {
    ...defaultConfig.resolver,
    alias: {
      ...defaultConfig.resolver.alias,
      'react-native-reanimated': path.resolve(__dirname, 'src/utils/reanimatedMock.js'),
    },
    extraNodeModules: {
      ...defaultConfig.resolver.extraNodeModules,
      'react-native-reanimated': path.resolve(__dirname, 'src/utils/reanimatedMock.js'),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      events: require.resolve('events'),
      fs: false,
    },
    transformIgnorePatterns: [
      `node_modules/(?!(?:${allowListRegex})/)`
    ],
    blockList: [
      /TempWrapperProject\/.*/,
      /test_backend_connectivity\.js$/,
      /\.test\.js$/,
      /\.spec\.js$/,
    ],
  },
  watchFolders: [
    path.resolve(__dirname),
  ],
};

module.exports = mergeConfig(defaultConfig, config);
