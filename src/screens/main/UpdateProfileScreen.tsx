import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateOfficerProfile } from '../../redux/slices/authSlice';
import { profileService } from '../../api/services/profileService';
import { colors, shadows, spacing, typography } from '../../utils';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const UpdateProfileScreen = ({ navigation, route }: any) => {
  const officer = useAppSelector((state) => state.auth.officer);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [shiftSchedule, setShiftSchedule] = useState('');

  // Load profile data when component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      if (!officer?.security_id) return;

      try {
        setIsLoading(true);
        const profile: any = await profileService.getProfile(officer.security_id);
        
        // Extract and set form values
        setName(
          profile.officer_name ||
          profile.name ||
          (profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}`.trim() 
            : '') ||
          profile.first_name ||
          officer.name ||
          ''
        );
        setEmail(profile.email_id || profile.email || profile.officer_email || officer.email_id || '');
        
        // Extract phone number from all possible backend fields (same as ProfileScreen)
        // ES5-compatible: no optional chaining
        const userObj = profile.user;
        const securityOfficerObj = profile.security_officer;
        const officerObj = profile.officer;
        
        // Helper function to check if a string is a phone number (not an email)
        const isValidPhoneNumber = (value: any): boolean => {
          if (!value || typeof value !== 'string') return false;
          const trimmed = value.trim();
          // Check if it's an email (contains @)
          if (trimmed.includes('@')) return false;
          // Check if it contains at least one digit
          if (!/\d/.test(trimmed)) return false;
          // Basic phone number validation (at least 6 digits, may contain +, -, spaces, parentheses)
          return /^[\d\s\+\-\(\)]{6,}$/.test(trimmed);
        };
        
        const phoneNumber = 
          // Direct profile fields (validate they're actually phone numbers, not emails)
          (profile.mobile && isValidPhoneNumber(profile.mobile) && profile.mobile) ||
          (profile.phone && isValidPhoneNumber(profile.phone) && profile.phone) ||
          (profile.officer_phone && isValidPhoneNumber(profile.officer_phone) && profile.officer_phone) ||
          (profile.phone_number && isValidPhoneNumber(profile.phone_number) && profile.phone_number) ||
          (profile.contact_number && isValidPhoneNumber(profile.contact_number) && profile.contact_number) ||
          (profile.contact_phone && isValidPhoneNumber(profile.contact_phone) && profile.contact_phone) ||
          (profile.phone_no && isValidPhoneNumber(profile.phone_no) && profile.phone_no) ||
          (profile.contact && isValidPhoneNumber(profile.contact) && profile.contact) ||
          // Nested user object fields
          (userObj && userObj.mobile && isValidPhoneNumber(userObj.mobile) && userObj.mobile) ||
          (userObj && userObj.phone && isValidPhoneNumber(userObj.phone) && userObj.phone) ||
          (userObj && userObj.phone_number && isValidPhoneNumber(userObj.phone_number) && userObj.phone_number) ||
          (userObj && userObj.contact_number && isValidPhoneNumber(userObj.contact_number) && userObj.contact_number) ||
          // SecurityOfficer model fields
          (securityOfficerObj && securityOfficerObj.mobile && isValidPhoneNumber(securityOfficerObj.mobile) && securityOfficerObj.mobile) ||
          (securityOfficerObj && securityOfficerObj.phone && isValidPhoneNumber(securityOfficerObj.phone) && securityOfficerObj.phone) ||
          // Officer profile fields
          (officerObj && officerObj.mobile && isValidPhoneNumber(officerObj.mobile) && officerObj.mobile) ||
          (officerObj && officerObj.phone && isValidPhoneNumber(officerObj.phone) && officerObj.phone) ||
          // Fallback to Redux officer data (only if it's a valid phone number)
          (officer.mobile && isValidPhoneNumber(officer.mobile) && officer.mobile) ||
          '';
        
        console.log('[UpdateProfileScreen] Phone number extraction:', {
          'profile.mobile': profile.mobile,
          'profile.phone': profile.phone,
          'profile.officer_phone': profile.officer_phone,
          'profile.officer_phone_is_email': profile.officer_phone && profile.officer_phone.includes('@'),
          'profile.user.mobile': userObj && userObj.mobile ? userObj.mobile : undefined,
          'profile.security_officer.mobile': securityOfficerObj && securityOfficerObj.mobile ? securityOfficerObj.mobile : undefined,
          'officer.mobile': officer.mobile,
          'extracted_phone': phoneNumber,
          'NOTE': 'officer_phone contains email, not phone number. User table data not included in profile response.',
        });
        
        setMobile(phoneNumber);
        setBadgeNumber(profile.badge_number || profile.badge_id || officer.badge_number || '');
        setShiftSchedule(profile.shift_schedule || profile.shift || officer.shift_schedule || '');
      } catch (error: any) {
        console.error('[UpdateProfileScreen] Error loading profile:', error);
        // Use existing officer data as fallback
        setName(officer.name || '');
        setEmail(officer.email_id || '');
        setMobile(officer.mobile || '');
        setBadgeNumber(officer.badge_number || '');
        setShiftSchedule(officer.shift_schedule || '');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [officer?.security_id]);

  const handleSave = async () => {
    if (!officer?.security_id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Officer ID not found',
      });
      return;
    }

    // Basic validation
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Name is required',
      });
      return;
    }

    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Email is required',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    try {
      setIsSaving(true);
      console.log('[UpdateProfileScreen] Updating profile with:', {
        security_id: officer.security_id,
        name: name.trim(),
        email_id: email.trim(),
        mobile: mobile.trim(),
        badge_number: badgeNumber.trim(),
        shift_schedule: shiftSchedule.trim(),
      });

      // Prepare update payload
      // Try multiple field names for phone number to ensure backend compatibility
      const updateData: any = {
        name: name.trim(),
        email_id: email.trim(),
      };

      // Send phone number with multiple possible field names for backend compatibility
      if (mobile.trim()) {
        updateData.mobile = mobile.trim();
        updateData.phone = mobile.trim(); // Also try 'phone' field name
        updateData.phone_number = mobile.trim(); // Also try 'phone_number' field name
      }
      if (badgeNumber.trim()) {
        updateData.badge_number = badgeNumber.trim();
      }
      if (shiftSchedule.trim()) {
        updateData.shift_schedule = shiftSchedule.trim();
      }

      // Call update API
      const response = await profileService.updateProfile(officer.security_id, updateData);
      
      console.log('[UpdateProfileScreen] Profile update response (full):', JSON.stringify(response, null, 2));

      // Extract updated phone number from response (backend might return it in different field)
      // profileService.updateProfile returns response.data directly, so response is already the data
      const responseData = response;
      
      // ES5-compatible: no optional chaining
      const responseUser = responseData.user;
      
      const updatedPhone = 
        (responseData.mobile && responseData.mobile) ||
        (responseData.phone && responseData.phone) ||
        (responseData.phone_number && responseData.phone_number) ||
        (responseUser && responseUser.mobile && responseUser.mobile) ||
        (responseUser && responseUser.phone && responseUser.phone) ||
        mobile.trim() || ''; // Fallback to what we sent

      console.log('[UpdateProfileScreen] Extracted updated phone from response:', {
        'responseData.mobile': responseData.mobile,
        'responseData.phone': responseData.phone,
        'responseData.phone_number': responseData.phone_number,
        'responseUser.mobile': responseUser && responseUser.mobile ? responseUser.mobile : undefined,
        'responseUser.phone': responseUser && responseUser.phone ? responseUser.phone : undefined,
        'mobile.trim()': mobile.trim(),
        'final updatedPhone': updatedPhone,
      });

      // Update Redux store with the new profile data (use response data if available, otherwise use form data)
      const updatedMobile = updatedPhone && updatedPhone.trim() !== '' ? updatedPhone : mobile.trim() || '';
      
      console.log('[UpdateProfileScreen] Updating Redux with:', {
        name: (responseData.name && responseData.name) || name.trim(),
        email_id: (responseData.email_id && responseData.email_id) || (responseData.email && responseData.email) || email.trim(),
        mobile: updatedMobile,
        badge_number: (responseData.badge_number && responseData.badge_number) || badgeNumber.trim() || '',
        shift_schedule: (responseData.shift_schedule && responseData.shift_schedule) || shiftSchedule.trim() || '',
      });
      
      dispatch(updateOfficerProfile({
        name: (responseData.name && responseData.name) || name.trim(),
        email_id: (responseData.email_id && responseData.email_id) || (responseData.email && responseData.email) || email.trim(),
        mobile: updatedMobile,
        badge_number: (responseData.badge_number && responseData.badge_number) || badgeNumber.trim() || '',
        shift_schedule: (responseData.shift_schedule && responseData.shift_schedule) || shiftSchedule.trim() || '',
      }));

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully',
      });

      // Force a profile refresh by navigating back and triggering ProfileScreen's useFocusEffect
      // The ProfileScreen will automatically refresh when it comes into focus
      // Navigate back after a short delay to allow toast to show
      setTimeout(() => {
        navigation.goBack();
        // Also trigger a refresh by calling the profile fetch again
        // This ensures the phone number is fetched from the backend
        console.log('[UpdateProfileScreen] Navigating back, ProfileScreen should refresh automatically');
      }, 1000);
    } catch (error: any) {
      console.error('[UpdateProfileScreen] Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to update profile';
      
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={colors.mediumGray}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Email Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.mediumGray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Phone Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.mediumGray}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        {/* Badge Number Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Badge Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter badge number"
            placeholderTextColor={colors.mediumGray}
            value={badgeNumber}
            onChangeText={setBadgeNumber}
            autoCapitalize="characters"
          />
        </View>

        {/* Shift Schedule Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Shift Schedule</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Morning Shift (6 AM - 2 PM)"
            placeholderTextColor={colors.mediumGray}
            value={shiftSchedule}
            onChangeText={setShiftSchedule}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>CANCEL</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.darkText,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#E5E7EB',
    ...shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.screenHeader,
    color: colors.darkText,
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.lightGrayBg || '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.darkText,
    borderWidth: 1,
    borderColor: colors.border || '#E5E7EB',
  },
  saveButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    ...shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
  cancelButton: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border || '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkText,
    letterSpacing: 0.5,
  },
});

