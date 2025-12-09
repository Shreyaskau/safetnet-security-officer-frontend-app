import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  AlertResponse: { alert: any };
  Logs: undefined;
  GeofenceArea: undefined;
  Broadcast: undefined;
  Profile: undefined;
};

export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Logs: undefined;
  GeofenceArea: undefined;
  Broadcast: undefined;
};














