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
} from 'react-native';
import { loginOfficer } from '../../api/SecurityAPI';
import { useAppDispatch } from '../../redux/hooks';
import { loginSuccess } from '../../redux/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils';
import Toast from 'react-native-toast-message';

export const LoginScreen = () => {
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

  const handleSkip = () => {
    // Set mock user data for development/testing
    const mockUserData = {
      token: 'skip_token_' + Date.now(),
      refreshToken: 'skip_refresh_token',
      officer: {
        security_id: '999',
        name: 'Test Officer',
        email_id: 'test.officer@safetnet.com',
        mobile: '+1234567890',
        security_role: 'security_officer',
        geofence_id: 'GEO001',
        user_image: '',
        status: 'active',
        stats: {
          total_responses: 156,
          avg_response_time: 3.2,
          active_hours: 240,
          area_coverage: 8.5,
          rating: 4.8,
        },
      },
    };

    // Dispatch login success to update auth state
    // AppNavigator will automatically switch to MainNavigator when isAuthenticated becomes true
    dispatch(loginSuccess({ ...mockUserData, navigateToSOS: false }));
    
    Toast.show({
      type: 'info',
      text1: 'Skipped Login',
      text2: 'Using test mode - some features may be limited',
    });
  };

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
      // Use email as username (backend accepts username field which can be email)
      const res = await loginOfficer(email, password);
      console.log("Logged in:", res);

      // Django REST API response format: { access, refresh, user: { id, username, email, role, ... } }
      console.log("=== LOGIN RESPONSE VALIDATION ===");
      console.log("Response structure:", {
        hasAccess: !!res.access,
        hasToken: !!res.token,
        hasRefresh: !!res.refresh,
        hasUser: !!res.user,
        responseKeys: Object.keys(res || {}),
      });
      
      const accessToken = res.access || res.token;
      const refreshToken = res.refresh;
      
      if (!accessToken) {
        console.error("❌ No access token in response");
        console.error("Response keys:", Object.keys(res || {}));
        console.error("Full response:", JSON.stringify(res, null, 2));
        throw new Error("Access token not received from server. Please check backend authentication configuration.");
      }

      // Extract user data from Django response
      const user = res.user || {};
      
      if (!user || !user.id) {
        console.warn("⚠️ User data missing or incomplete in response");
        console.warn("User object:", user);
      } else {
        console.log("✅ User data validated:", {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
      }
      const userData = {
        token: accessToken, // Use access token
        refreshToken: refreshToken, // Store refresh token for future use
        officer: {
          security_id: (() => {
            if (user && user.id) {
              return String(user.id);
            }
            if (res && res.id) {
              return String(res.id);
            }
            return '';
          })(),
          name: user.first_name || user.last_name 
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
            : user.username || email, // Use full name if available, else username
          email_id: user.email || user.username || email,
          mobile: user.mobile || '',
          security_role: user.role || 'security_officer',
          geofence_id: user.geofence_id || '',
          user_image: user.user_image || user.image || '',
          status: user.status || 'active',
        },
      };

      // Dispatch login success to update auth state with flag to navigate to SOS
      dispatch(loginSuccess({ ...userData, navigateToSOS: true }));
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err.response && err.response.data ? err.response.data : 'unknown');
      console.error("Error status:", err.response && err.response.status ? err.response.status : 'unknown');
      
      const status = err.response && err.response.status ? err.response.status : undefined;
      let errorMessage = 'Invalid Credentials';
      
      if (status === 502) {
        // Bad Gateway - Render service is down or sleeping
        errorMessage = 'Backend service is not responding. The service may be sleeping (Render free tier takes 2-3 minutes to wake up). Please wait and try again, or check Render dashboard.';
      } else if (status === 503) {
        errorMessage = 'Service temporarily unavailable. The server is starting up or overloaded. Please wait 2-3 minutes and try again.';
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section (40% of screen) */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️</Text>
          <Text style={styles.appName}>SafeTNet Security</Text>
          <Text style={styles.subtitle}>Officer Portal</Text>
        </View>

        {/* Form Section (60% of screen) */}
        <View style={styles.form}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.welcomeSubtext}>Sign in to continue monitoring</Text>

          <Text style={styles.inputLabel}>Badge ID or Email</Text>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="Enter your badge ID or email"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.mediumGray}
            returnKeyType="next"
            onSubmitEditing={() => {
              // Focus password field when Enter is pressed on email field
              if (passwordInputRef.current) {
                passwordInputRef.current.focus();
              }
            }}
          />

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              ref={passwordInputRef}
              style={[
                styles.input,
                styles.passwordInput,
                passwordFocused && styles.inputFocused,
              ]}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
              placeholderTextColor={colors.mediumGray}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text style={styles.skipButtonText}>Skip Login (Test Mode)</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>v2.2.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Header Section (40% of screen)
  header: {
    backgroundColor: colors.secondary, // #1E3A8A
    paddingTop: 80, // Account for status bar
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
    opacity: 0.7,
    marginTop: 4,
  },
  // Form Section (60% of screen)
  form: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    marginTop: -24, // Overlap with header
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.darkText,
    letterSpacing: -0.5,
  },
  welcomeSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.lightText,
    marginTop: 4,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.lightText,
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border, // #E2E8F0
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '400',
    color: colors.darkText,
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
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
  eyeIconText: {
    fontSize: 20,
    color: colors.mediumGray,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.primary,
    textAlign: 'right',
  },
  loginButton: {
    height: 52,
    backgroundColor: colors.primary, // #2563EB
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
  skipButton: {
    height: 44,
    backgroundColor: 'transparent',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mediumGray,
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.captionText,
    textAlign: 'center',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
});
