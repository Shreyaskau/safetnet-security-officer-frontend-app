declare module 'react-native-dotenv' {
  export const API_BASE_URL: string;
  export const SOCKET_URL: string;
  export const GOOGLE_MAPS_API_KEY: string;
  
  const Config: {
    API_BASE_URL?: string;
    SOCKET_URL?: string;
    GOOGLE_MAPS_API_KEY?: string;
  };
  
  export default Config;
}

