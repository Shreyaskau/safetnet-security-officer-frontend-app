import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { loginOfficer } from '../../api/SecurityAPI';
import { useAppDispatch } from '../../redux/hooks';
import { loginSuccess } from '../../redux/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../contexts/ThemeContext';

// Safe logo loading - will use image if file exists, otherwise fallback to emoji
const LOGO_PATH = '../../assets/images/safetnet-logo.png';
let logoSource = null;
try {
  logoSource = require(LOGO_PATH);
} catch (e) {
  logoSource = null;
}

export const LoginScreen = () => {
  const { colors: themeColors, effectiveTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter email and password',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Make login request
      const res = await loginOfficer(email, password);
      
      // Extract tokens and user data (optimized - minimal processing)
      const accessToken = res.access || res.token;
      const user = res.user || {};
      
      if (!accessToken) {
        throw new Error("Access token not received from server");
      }

      // Prepare user data (optimized - single object creation)
      const userData = {
        token: accessToken,
        refreshToken: res.refresh,
        officer: {
          security_id: String(user.id || ''),
          name: (user.first_name && user.last_name) 
            ? `${user.first_name} ${user.last_name}`.trim() 
            : (user.first_name || user.username || email),
          email_id: user.email || user.username || email,
          mobile: user.mobile || '',
          security_role: user.role || 'security_officer',
          geofence_id: user.geofence_id || '',
          user_image: user.user_image || user.image || '',
          status: user.status || 'active',
        },
      };

      // Dispatch login success immediately - navigation happens automatically
      dispatch(loginSuccess({ ...userData, navigateToSOS: false }));
      setIsLoading(false); // Clear loading state immediately
    } catch (err: any) {
      setIsLoading(false); // Clear loading state on error
      console.error("Login error:", err);
      console.error("Error response:", err.response && err.response.data ? err.response.data : 'unknown');
      console.error("Error status:", err.response && err.response.status ? err.response.status : 'unknown');
      
      const status = err.response && err.response.status ? err.response.status : undefined;
      const isNetworkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response;
      let errorMessage = 'Invalid Credentials';
      
      // Handle network errors (no response from server)
      if (isNetworkError) {
        errorMessage = 'Cannot reach server. The backend service may be sleeping (Render free tier takes 30-90 seconds to wake up). Please wait 1-2 minutes and try again.';
      } else if (status === 502) {
        // Bad Gateway - Render service is down or sleeping
        errorMessage = 'Backend service is not responding. The service may be sleeping (Render free tier takes 30-90 seconds to wake up). Please wait and try again, or check Render dashboard.';
      } else if (status === 503) {
        errorMessage = 'Service temporarily unavailable. The server is starting up or overloaded. Please wait 1-2 minutes and try again.';
      } else if (status === 400) {
        // 400 Bad Request - show backend's specific error message
        // Handle Django REST Framework error formats
        const backendError = err.response && err.response.data ? err.response.data : null;
        
        if (backendError) {
          // Format: { "non_field_errors": ["Invalid credentials."] }
          if (backendError.non_field_errors && Array.isArray(backendError.non_field_errors)) {
            errorMessage = backendError.non_field_errors[0];
          }
          // Format: { "message": "Invalid credentials" }
          else if (backendError.message) {
            errorMessage = backendError.message;
          }
          // Format: { "error": "Invalid credentials" }
          else if (backendError.error) {
            errorMessage = backendError.error;
          }
          // Format: { "detail": "Invalid credentials" }
          else if (backendError.detail) {
            errorMessage = backendError.detail;
          }
          // Format: string
          else if (typeof backendError === 'string') {
            errorMessage = backendError;
          }
          // Fallback
          else {
            errorMessage = err.message || 'Invalid credentials. Please check your username and password.';
          }
        } else {
          errorMessage = err.message || 'Invalid credentials. Please check your username and password.';
        }
        
        // Log full error details for debugging
        console.error("400 Error Details:", JSON.stringify(backendError, null, 2));
      } else if (status === 401) {
        errorMessage = 'Invalid username or password. Please try again.';
      } else if (status === 503) {
        errorMessage = 'Service temporarily unavailable. The server is down or overloaded. Please try again later.';
      } else if (status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = (err.response && err.response.data && err.response.data.message) || (err.response && err.response.data && err.response.data.error) || err.message || 'Invalid Credentials';
      }
      
      Alert.alert('Login Failed', errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic styles based on theme
  const isDark = effectiveTheme === 'dark';
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? themeColors.background : colors.white,
    },
    header: {
      backgroundColor: isDark ? themeColors.background : colors.secondary,
      paddingTop: 80,
      paddingBottom: 32,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    logoFallback: {
      fontSize: 80,
      color: isDark ? themeColors.text : colors.white,
    },
    appName: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? themeColors.text : colors.white,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '400',
      color: isDark ? themeColors.lightText : colors.white,
      opacity: 0.7,
      marginTop: 4,
    },
    form: {
      backgroundColor: isDark ? themeColors.lightGrayBg : colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 32,
      marginTop: -24,
      flex: 1,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: '600',
      color: themeColors.text,
      letterSpacing: -0.5,
    },
    welcomeSubtext: {
      fontSize: 14,
      fontWeight: '400',
      color: themeColors.lightText,
      marginTop: 4,
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: themeColors.lightText,
      marginBottom: 8,
    },
    input: {
      height: 52,
      backgroundColor: isDark ? themeColors.background : colors.white,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 15,
      fontWeight: '400',
      color: themeColors.text,
      marginBottom: 16,
    },
    inputFocused: {
      borderColor: themeColors.primary,
      borderWidth: 2,
    },
    eyeIconText: {
      fontSize: 20,
      color: themeColors.lightText,
    },
    forgotPassword: {
      fontSize: 14,
      fontWeight: '400',
      color: themeColors.primary,
      textAlign: 'right',
    },
    loginButton: {
      height: 52,
      backgroundColor: themeColors.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.white,
      letterSpacing: 0.5,
    },
    versionText: {
      fontSize: 12,
      fontWeight: '400',
      color: themeColors.lightText,
      textAlign: 'center',
      position: 'absolute',
      bottom: 16,
      alignSelf: 'center',
    },
  });

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section (40% of screen) */}
        <View style={dynamicStyles.header}>
          <View style={styles.logoContainer}>
            {logoSource ? (
              <Image
                source={logoSource}
                style={styles.logoImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={dynamicStyles.logoFallback}>🛡️</Text>
            )}
          </View>
          <Text style={dynamicStyles.appName}>SafeTNet Security</Text>
          <Text style={dynamicStyles.subtitle}>Officer Portal</Text>
        </View>

        {/* Form Section (60% of screen) */}
        <View style={dynamicStyles.form}>
          <Text style={dynamicStyles.welcomeText}>Welcome Back</Text>
          <Text style={dynamicStyles.welcomeSubtext}>Sign in to continue monitoring</Text>

          <Text style={dynamicStyles.inputLabel}>Badge ID or Email</Text>
          <TextInput
            style={[dynamicStyles.input, emailFocused && dynamicStyles.inputFocused]}
            placeholder="Enter your badge ID or email"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={themeColors.lightText}
            returnKeyType="next"
            onSubmitEditing={() => {
              // Focus password field when Enter is pressed on email field
              if (passwordInputRef.current) {
                passwordInputRef.current.focus();
              }
            }}
          />

          <Text style={dynamicStyles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              ref={passwordInputRef}
              style={[
                dynamicStyles.input,
                styles.passwordInput,
                passwordFocused && dynamicStyles.inputFocused,
              ]}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
              placeholderTextColor={themeColors.lightText}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={dynamicStyles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword' as never)}
          >
            <Text style={dynamicStyles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={dynamicStyles.loginButtonText}>
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </Text>
          </TouchableOpacity>

          <Text style={dynamicStyles.versionText}>v2.2.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
    zIndex: 1,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
});
