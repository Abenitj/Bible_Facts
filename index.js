// Safe CSS import - won't crash if CSS fails to load
try {
  require('./global.css');
} catch (error) {
  // CSS import is optional - NativeWind will work without it in some cases
  console.warn('CSS import failed (this is OK):', error.message);
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
