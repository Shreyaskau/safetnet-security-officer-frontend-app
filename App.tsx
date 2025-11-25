import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, persistor } from './src/redux/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import Toast from 'react-native-toast-message';

const App = () => {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <SafeAreaProvider>
              <AppNavigator />
              <Toast />
            </SafeAreaProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;

