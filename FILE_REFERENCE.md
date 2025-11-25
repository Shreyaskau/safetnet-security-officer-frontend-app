# Project Files Quick Reference

## 📋 One-Line File Descriptions

### Root Configuration Files
- **`package.json`** - Main npm dependencies and scripts (React Native 0.73.2)
- **`packages.json`** - Your modified version with React Native 0.82.1 (not currently used)
- **`package-lock.json`** - Locked dependency versions for reproducible installs
- **`tsconfig.json`** - TypeScript compiler configuration
- **`babel.config.js`** - Babel transpiler config (converts modern JS/TS to compatible code)
- **`metro.config.js`** - Metro bundler configuration (bundles JS for React Native)
- **`app.json`** - App metadata (name, display name, etc.)
- **`index.js`** - Application entry point (registers app with React Native)
- **`App.tsx`** - Root React component (wraps entire app with providers)

### Android Build Files
- **`android/build.gradle`** - Root Android build configuration (minSdk, compileSdk, etc.)
- **`android/app/build.gradle`** - App-specific Android build config (dependencies, signing)
- **`android/gradle.properties`** - Gradle properties (Hermes, memory settings)
- **`android/settings.gradle`** - Gradle project settings
- **`android/gradle/wrapper/`** - Gradle wrapper files (gradlew scripts)
- **`android/app/src/main/AndroidManifest.xml`** - Android app manifest (permissions, activities)
- **`android/app/src/main/res/xml/network_security_config.xml`** - Network security config (allows HTTP for dev)

### Source Code - API Layer
- **`src/api/axios.config.ts`** - Axios HTTP client configuration
- **`src/api/endpoints.ts`** - API endpoint URLs
- **`src/api/services/alertService.ts`** - Alert-related API calls
- **`src/api/services/authService.ts`** - Authentication API calls
- **`src/api/services/broadcastService.ts`** - Broadcast API calls
- **`src/api/services/geofenceService.ts`** - Geofence API calls
- **`src/api/services/locationService.ts`** - Location API calls
- **`src/api/services/profileService.ts`** - Profile API calls

### Source Code - Components
- **`src/components/alerts/AlertCard.tsx`** - Alert card UI component
- **`src/components/alerts/AlertFilter.tsx`** - Alert filtering component
- **`src/components/alerts/AlertStats.tsx`** - Alert statistics component
- **`src/components/common/Avatar.tsx`** - User avatar component
- **`src/components/common/Badge.tsx`** - Badge/indicator component
- **`src/components/common/Button.tsx`** - Reusable button component
- **`src/components/common/Card.tsx`** - Card container component
- **`src/components/common/EmptyState.tsx`** - Empty state placeholder
- **`src/components/common/ErrorBoundary.tsx`** - Error boundary for crash handling
- **`src/components/common/FloatingActionButton.tsx`** - FAB component
- **`src/components/common/Input.tsx`** - Text input component
- **`src/components/common/LoadingSpinner.tsx`** - Loading indicator
- **`src/components/common/SkeletonLoader.tsx`** - Skeleton loading placeholder
- **`src/components/maps/CustomMarker.tsx`** - Custom map marker
- **`src/components/maps/GeofenceOverlay.tsx`** - Geofence visualization
- **`src/components/maps/MapControls.tsx`** - Map control buttons
- **`src/components/maps/MapLegend.tsx`** - Map legend component
- **`src/components/maps/RoutePolyline.tsx`** - Route line on map
- **`src/components/maps/SecurityMap.tsx`** - Main map component
- **`src/components/modals/AcceptAlertModal.tsx`** - Alert acceptance modal
- **`src/components/modals/BroadcastProgressModal.tsx`** - Broadcast progress modal
- **`src/components/modals/LogoutModal.tsx`** - Logout confirmation modal
- **`src/components/navigation/BottomTabNavigator.tsx`** - Bottom tab navigation

### Source Code - Hooks
- **`src/hooks/useAlerts.ts`** - Alert management hook
- **`src/hooks/useAuth.ts`** - Authentication state hook
- **`src/hooks/useLocation.ts`** - Location tracking hook
- **`src/hooks/useNetworkStatus.ts`** - Network connectivity hook
- **`src/hooks/usePermissions.ts`** - Permission request hook
- **`src/hooks/usePushNotifications.ts`** - Push notification hook (uses Firebase)
- **`src/hooks/useSocket.ts`** - WebSocket connection hook

### Source Code - Navigation
- **`src/navigation/AppNavigator.tsx`** - Root navigation setup
- **`src/navigation/AuthNavigator.tsx`** - Authentication flow navigation
- **`src/navigation/CustomDrawer.tsx`** - Custom drawer component
- **`src/navigation/MainNavigator.tsx`** - Main app navigation
- **`src/navigation/TabNavigator.tsx`** - Tab navigation setup

### Source Code - Redux (State Management)
- **`src/redux/store.ts`** - Redux store configuration
- **`src/redux/hooks.ts`** - Typed Redux hooks
- **`src/redux/slices/alertSlice.ts`** - Alert state slice
- **`src/redux/slices/authSlice.ts`** - Authentication state slice
- **`src/redux/slices/locationSlice.ts`** - Location state slice
- **`src/redux/slices/settingsSlice.ts`** - Settings state slice

### Source Code - Screens
- **`src/screens/auth/SplashScreen.tsx`** - App splash screen
- **`src/screens/auth/LoginScreen.tsx`** - Login screen
- **`src/screens/auth/ForgotPasswordScreen.tsx`** - Password reset screen
- **`src/screens/common/NotificationPermissionScreen.tsx`** - Permission request screen
- **`src/screens/common/OfflineScreen.tsx`** - Offline state screen
- **`src/screens/common/SearchScreen.tsx`** - Search functionality screen
- **`src/screens/main/AlertResponseScreen.tsx`** - Alert response screen
- **`src/screens/main/BroadcastScreen.tsx`** - Broadcast alert screen
- **`src/screens/main/DashboardScreen.tsx`** - Main dashboard
- **`src/screens/main/DashboardScreenWithBottomNav.tsx`** - Dashboard with bottom nav
- **`src/screens/main/GeofenceMapScreen.tsx`** - Geofence map view
- **`src/screens/main/LogsScreen.tsx`** - Alert logs screen
- **`src/screens/main/MainLayout.tsx`** - Main layout wrapper
- **`src/screens/main/ProfileScreen.tsx`** - User profile screen
- **`src/screens/settings/NotificationSettingsScreen.tsx`** - Notification settings
- **`src/screens/settings/PrivacyScreen.tsx`** - Privacy settings
- **`src/screens/settings/SettingsScreen.tsx`** - Settings screen

### Source Code - Services
- **`src/services/LocationService.ts`** - Background location service
- **`src/services/NotificationService.ts`** - Push notification service
- **`src/services/SocketService.ts`** - WebSocket service

### Source Code - Types
- **`src/types/alert.types.ts`** - Alert TypeScript types
- **`src/types/api.types.ts`** - API response types
- **`src/types/location.types.ts`** - Location-related types
- **`src/types/navigation.types.ts`** - Navigation types
- **`src/types/user.types.ts`** - User data types

### Source Code - Utils
- **`src/utils/borderRadius.ts`** - Border radius constants
- **`src/utils/colors.ts`** - Color palette
- **`src/utils/constants.ts`** - App constants
- **`src/utils/helpers.ts`** - Helper functions
- **`src/utils/index.ts`** - Utility exports
- **`src/utils/permissions.ts`** - Permission utilities
- **`src/utils/shadows.ts`** - Shadow styles
- **`src/utils/spacing.ts`** - Spacing constants
- **`src/utils/storage.ts`** - AsyncStorage utilities
- **`src/utils/typography.ts`** - Typography styles
- **`src/utils/validators.ts`** - Form validation functions

### Documentation Files
- **`README.md`** - Main project documentation
- **`SETUP_INSTRUCTIONS.md`** - Setup and installation guide
- **`QUICK_START.md`** - Quick start guide
- **`TESTING_ON_DEVICE.md`** - Device testing instructions
- **`COMPLETION_CHECKLIST.md`** - Feature completion checklist
- **`DESIGN_VERIFICATION.md`** - Design verification document
- **`FINAL_FEATURES_CHECKLIST.md`** - Final features checklist
- **`MEASUREMENT_VERIFICATION.md`** - Measurement verification
- **`COMPLETE_IMPLEMENTATION_SUMMARY.md`** - Implementation summary
- **`PROJECT_ANALYSIS.md`** - Project analysis and issues (just created)
- **`FILE_REFERENCE.md`** - This file (file reference guide)

### Other Files
- **`.env`** - Environment variables (API URLs, keys)
- **`package_old.json`** - Backup of old package.json
- **`ios/Info.plist`** - iOS app configuration
- **`TempWrapperProject/`** - Temporary wrapper project directory

---

## 🎯 Key Files to Know

**Most Important:**
1. `package.json` - Dependencies and scripts
2. `App.tsx` - Root component
3. `src/navigation/AppNavigator.tsx` - Navigation setup
4. `src/redux/store.ts` - State management
5. `android/app/build.gradle` - Android build config

**Configuration:**
- `tsconfig.json` - TypeScript settings
- `babel.config.js` - Babel transpilation
- `metro.config.js` - Bundler config
- `.env` - Environment variables

**Entry Points:**
- `index.js` - App registration
- `App.tsx` - Root component

