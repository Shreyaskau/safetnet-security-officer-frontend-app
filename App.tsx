import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { store, persistor } from './src/redux/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import Toast from 'react-native-toast-message';

const AppContent = () => {
  const { effectiveTheme } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={effectiveTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={effectiveTheme === 'dark' ? '#0F172A' : '#FFFFFF'}
      />
      <AppNavigator />
      <Toast />
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider>
              <SafeAreaProvider>
                <AppContent />
              </SafeAreaProvider>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;
