/** @format */
import React from 'react';
import { AppRegistry, AppState, I18nManager, UIManager, Image, Platform } from 'react-native';
import { Provider } from 'react-redux';
/* @ts-ignore */ import {name as appName} from './app.json';
import { RootWithNavigationState, store, persistor } from './src/App';
import { PersistGate } from 'redux-persist/integration/react'
import SplashScreen from 'react-native-splash-screen';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

AppState.addEventListener('change', (status) => {
  if (status === 'active') {
    SplashScreen.hide();
  }
})

AppRegistry.registerComponent(appName, () => () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Image source={require('./assets/background.png')} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -999
      }} />
      <RootWithNavigationState />
    </PersistGate>
  </Provider>
));
