import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  Alert as RNAlert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector } from '../../redux/hooks';
import { Button } from '../../components/common/Button';
import { BroadcastProgressModal } from '../../components/modals/BroadcastProgressModal';
import { broadcastService } from '../../api/services/broadcastService';
import { profileService } from '../../api/services/profileService';
import { geofenceService } from '../../api/services/geofenceService';
import { requestLocationPermission } from '../../utils/permissions';
import { useAlerts } from '../../hooks/useAlerts';
import { colors, typography, spacing } from '../../utils';
import { Alert } from '../../types/alert.types';
import { useTheme } from '../../contexts/ThemeContext';
import { alertService } from '../../api/services/alertService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export const BroadcastScreen = ({ navigation, route }: any) => {
  const officer = useAppSelector((state) => state.auth.officer);
  const { refreshAlerts } = useAlerts();
  const { colors: themeColors } = useTheme();
  
  // Get alert data from route params if editing
  const alertFromRoute: Alert | undefined = route?.params?.alert;
  const isEditMode = !!alertFromRoute;
  
  // State for fetched alert data
  const [alertToEdit, setAlertToEdit] = useState<Alert | undefined>(alertFromRoute);
  const [isLoadingAlert, setIsLoadingAlert] = useState(false);
  
  // Initialize state with alert data if editing, otherwise defaults
  const [message, setMessage] = useState(
    alertFromRoute?.message || 'I need help, some one following me'
  );
  const [alertType, setAlertType] = useState<'general' | 'warning' | 'emergency'>(
    (alertFromRoute?.original_alert_type as 'general' | 'warning' | 'emergency') || 
    (alertFromRoute?.alert_type === 'emergency' ? 'emergency' : 'general') || 
    'general'
  );
  const [showProgress, setShowProgress] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previousMessage, setPreviousMessage] = useState<string>('');
  
  // Fetch full alert details when in edit mode
  useEffect(() => {
    const fetchAlertDetails = async () => {
      if (!isEditMode || !alertFromRoute) return;
      
      const alertId = alertFromRoute.log_id || alertFromRoute.id;
      if (!alertId) {
        console.warn('[BroadcastScreen] No alert ID found, using route params data');
        return;
      }
      
      setIsLoadingAlert(true);
      try {
        console.log('[BroadcastScreen] Fetching full alert details for ID:', alertId);
        // Try to fetch full alert details from API
        const endpoint = `/sos/${alertId}/`;
        const { default: axiosInstance } = await import('../../api/axios.config');
        const response = await axiosInstance.get(endpoint);
        
        const fetchedAlert = response.data;
        console.log('[BroadcastScreen] ✅ Fetched alert details:', JSON.stringify(fetchedAlert, null, 2));
        
        // Update state with fetched alert
        setAlertToEdit(fetchedAlert);
        
        // Update form fields with fetched data
        if (fetchedAlert.message) {
          setMessage(fetchedAlert.message);
        }
        
        // Determine alert type from fetched data
        const type = (fetchedAlert.original_alert_type as 'general' | 'warning' | 'emergency') || 
                     (fetchedAlert.alert_type === 'emergency' ? 'emergency' : 'general');
        setAlertType(type);
        
      } catch (error: any) {
        console.warn('[BroadcastScreen] Failed to fetch alert details, using route params data:', error.message);
        // If fetch fails, continue with route params data
        setAlertToEdit(alertFromRoute);
      } finally {
        setIsLoadingAlert(false);
      }
    };
    
    fetchAlertDetails();
  }, [isEditMode, alertFromRoute]);
  
  // Update form when alert data changes
  useEffect(() => {
    if (alertToEdit) {
      console.log('[BroadcastScreen] Alert data available:', {
        message: alertToEdit.message,
        original_alert_type: alertToEdit.original_alert_type,
        alert_type: alertToEdit.alert_type,
        priority: alertToEdit.priority,
        geofence_id: alertToEdit.geofence_id,
        location: alertToEdit.location,
      });
      
      if (alertToEdit.message) {
        setMessage(alertToEdit.message);
      }
      
      const type = (alertToEdit.original_alert_type as 'general' | 'warning' | 'emergency') || 
                   (alertToEdit.alert_type === 'emergency' ? 'emergency' : 'general');
      setAlertType(type);
    }
  }, [alertToEdit]);

  // Map alert types to priority levels
  const getPriority = (type: 'general' | 'warning' | 'emergency'): 'low' | 'medium' | 'high' => {
    switch (type) {
      case 'general':
        return 'low';
      case 'warning':
        return 'medium';
      case 'emergency':
        return 'high';
      default:
        return 'low';
    }
  };
  
  const priority = getPriority(alertType);

  const alertTypes = [
    { key: 'general' as const, label: 'General Notice', icon: 'notifications' },
    { key: 'warning' as const, label: 'Warning', icon: 'warning' },
    { key: 'emergency' as const, label: 'Emergency', icon: 'emergency' },
  ];

  const defaultTemplates = [
    {
      id: 'suspicious',
      label: 'Suspicious activity',
      message: '⚠️ ALERT: Suspicious activity detected in the area. All personnel please remain vigilant and report any unusual behavior immediately.',
      isCustom: false,
    },
    {
      id: 'secured',
      label: 'Area secured',
      message: '✅ UPDATE: Area has been secured and verified. Normal operations can resume. All clear for regular activities.',
      isCustom: false,
    },
    {
      id: 'shift',
      label: 'Shift change',
      message: '📋 NOTICE: Shift change in progress. Incoming team is taking over patrol duties. All personnel please coordinate handover.',
      isCustom: false,
    },
  ];

  const [customTemplates, setCustomTemplates] = useState<Array<{ id: string; label: string; message: string; isCustom: boolean }>>([]);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [newTemplateLabel, setNewTemplateLabel] = useState('');
  const [newTemplateMessage, setNewTemplateMessage] = useState('');

  // Load custom templates from storage
  useEffect(() => {
    const loadCustomTemplates = async () => {
      try {
        const stored = await AsyncStorage.getItem('custom_alert_templates');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCustomTemplates(parsed);
        }
      } catch (error) {
        console.error('[BroadcastScreen] Error loading custom templates:', error);
      }
    };
    loadCustomTemplates();
  }, []);

  // Fetch real user count from geofence
  useEffect(() => {
    const fetchUserCount = async () => {
      if (!officer) return;

      try {
        let geofenceId = officer.geofence_id;
        
        // If geofence_id is empty or not numeric, try to get it from profile
        if (!geofenceId || geofenceId === '' || geofenceId === '0' || isNaN(Number(geofenceId))) {
          try {
            const profile = await profileService.getProfile(officer.security_id);
            const assignedGeofence = (profile as any)?.assigned_geofence;
            if (assignedGeofence?.id) {
              geofenceId = String(assignedGeofence.id);
            }
          } catch (profileError) {
            console.warn('[BroadcastScreen] Failed to fetch profile for geofence_id:', profileError);
          }
        }

        if (geofenceId && geofenceId !== '' && geofenceId !== '0') {
          try {
            // Try to get user count from geofence details or getUsersInArea
            const geofenceDetails = await geofenceService.getGeofenceDetails(geofenceId);
            let userCount = geofenceDetails.active_users_count;
            
            // If active_users_count is not available, try getUsersInArea
            if (!userCount || userCount === 0) {
              try {
                const usersInArea = await geofenceService.getUsersInArea(geofenceId);
                userCount = (usersInArea as any)?.data?.count || (usersInArea as any)?.count || 0;
              } catch (usersError) {
                console.warn('[BroadcastScreen] Failed to fetch users in area:', usersError);
              }
            }
            
            console.log('[BroadcastScreen] Fetched user count:', userCount);
            setTotalUsers(userCount || 0);
          } catch (geofenceError) {
            console.warn('[BroadcastScreen] Failed to fetch geofence details for user count:', geofenceError);
            setTotalUsers(0);
          }
        } else {
          // No geofence_id available - silently set to 0 (no users currently)
          setTotalUsers(0);
        }
      } catch (error) {
        console.error('[BroadcastScreen] Error fetching user count:', error);
        setTotalUsers(0);
      }
    };

    fetchUserCount();
  }, [officer]);

  // Combine default and custom templates
  const quickTemplates = [...defaultTemplates, ...customTemplates];

  const handleSend = async () => {
    if (!message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a message',
      });
      return;
    }

    if (!officer) return;

    setShowProgress(true);
    setBroadcastProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setBroadcastProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Request location permission first
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Location permission is required to send alerts',
        });
        clearInterval(progressInterval);
        setShowProgress(false);
        setBroadcastProgress(0);
        return;
      }

      // Get geofence_id - use from officer or fetch from profile/geofence service if empty
      // IMPORTANT: Backend expects numeric geofence_id, not name string
      let geofenceId = officer.geofence_id;
      
      // Check if geofence_id is empty or not numeric
      if (!geofenceId || geofenceId === '' || geofenceId === '0' || isNaN(Number(geofenceId))) {
        console.log('[BroadcastScreen] geofence_id is empty or not numeric, fetching geofence details...');
        try {
          // First try to get geofence name from profile
          const profile = await profileService.getProfile(officer.security_id);
          console.log('[BroadcastScreen] Profile data:', JSON.stringify(profile, null, 2));
          
          const geofenceName = (profile as any)?.officer_geofence || 
                              (profile as any)?.geofence_name ||
                              (profile as any)?.assigned_geofence?.name ||
                              '';
          
          // Try to get numeric ID from assigned_geofence object (if profile has it)
          const assignedGeofence = (profile as any)?.assigned_geofence;
          if (assignedGeofence?.id) {
            geofenceId = String(assignedGeofence.id);
            console.log('[BroadcastScreen] ✅ Got numeric geofence_id from assigned_geofence.id:', geofenceId);
          } else if (geofenceName) {
            // If we have geofence name but not ID, fetch geofence details to get the ID
            console.log('[BroadcastScreen] Found geofence name:', geofenceName, '- fetching details to get ID...');
            try {
              const geofenceDetails = await geofenceService.getGeofenceDetails(geofenceName);
              // Extract ID from geofence_id field (should be numeric)
              if (geofenceDetails.geofence_id && !isNaN(Number(geofenceDetails.geofence_id))) {
                geofenceId = String(geofenceDetails.geofence_id);
                console.log('[BroadcastScreen] ✅ Got numeric geofence_id from geofence details:', geofenceId);
              } else {
                console.warn('[BroadcastScreen] ⚠️ Geofence details returned non-numeric ID:', geofenceDetails.geofence_id);
              }
            } catch (geofenceError: any) {
              console.warn('[BroadcastScreen] Failed to fetch geofence details:', geofenceError.message);
              // Check if geofenceService returned data with assigned_geofence
              if (geofenceError?.response?.data?.assigned_geofence?.id) {
                geofenceId = String(geofenceError.response.data.assigned_geofence.id);
                console.log('[BroadcastScreen] ✅ Got numeric geofence_id from error response:', geofenceId);
              }
            }
          } else {
            console.warn('[BroadcastScreen] No geofence name found in profile');
          }
        } catch (profileError) {
          console.warn('[BroadcastScreen] Failed to fetch profile for geofence_id:', profileError);
        }
      }
      
      // Final validation
      if (geofenceId && isNaN(Number(geofenceId))) {
        console.warn('[BroadcastScreen] ⚠️ WARNING: geofence_id is still not numeric:', geofenceId);
        console.warn('[BroadcastScreen] Backend might reject this or set geofence to null');
        // Try to extract ID from geofence name by fetching geofence details one more time
        try {
          const geofenceDetails = await geofenceService.getGeofenceDetails(geofenceId);
          if (geofenceDetails.geofence_id && !isNaN(Number(geofenceDetails.geofence_id))) {
            geofenceId = String(geofenceDetails.geofence_id);
            console.log('[BroadcastScreen] ✅ Finally got numeric geofence_id:', geofenceId);
          }
        } catch (finalError) {
          console.error('[BroadcastScreen] Could not convert geofence name to ID:', finalError);
        }
      }
      
      console.log('[BroadcastScreen] Final geofence_id to send:', geofenceId, '(type:', typeof geofenceId, ', isNumeric:', !isNaN(Number(geofenceId)), ')');

      let broadcastResult;
      
      if (isEditMode && alertToEdit) {
        // Update existing alert
        const alertId = alertToEdit.log_id || alertToEdit.id;
        if (!alertId) {
          throw new Error('Alert ID not found');
        }
        
        console.log('[BroadcastScreen] Updating alert:', alertId);
        broadcastResult = await broadcastService.updateBroadcast(alertId, {
          security_id: officer.security_id,
          geofence_id: geofenceId || alertToEdit.geofence_id || '',
          message: message.trim(),
          alert_type: alertType,
          priority: priority === 'high' || priority === 'medium',
          priorityLevel: priority,
          // Use existing location or fetch new one
          location_lat: alertToEdit.location?.latitude,
          location_long: alertToEdit.location?.longitude,
        } as any);
        console.log('[BroadcastScreen] Alert updated successfully:', broadcastResult);
      } else {
        // Create new alert
        broadcastResult = await broadcastService.sendBroadcast({
          security_id: officer.security_id,
          geofence_id: geofenceId || '',
          message: message.trim(),
          alert_type: alertType,
          priority: priority === 'high' || priority === 'medium',
          priorityLevel: priority,
        } as any);
        console.log('[BroadcastScreen] Broadcast sent successfully:', broadcastResult);
      }

      clearInterval(progressInterval);
      setBroadcastProgress(100);

      // Refresh alerts after successful broadcast
      try {
        console.log('[BroadcastScreen] Refreshing alerts after broadcast...');
        await refreshAlerts();
        console.log('[BroadcastScreen] Alerts refreshed');
      } catch (refreshError) {
        console.warn('[BroadcastScreen] Failed to refresh alerts:', refreshError);
        // Don't fail the broadcast if refresh fails
      }

      setTimeout(() => {
        setShowProgress(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: isEditMode ? 'Alert updated successfully' : 'Broadcast sent successfully',
        });
        navigation.goBack();
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      setShowProgress(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send broadcast',
      });
    }
  };

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      backgroundColor: themeColors.lightGrayBg,
      position: 'relative',
    },
    headerLeft: {
      position: 'absolute',
      left: spacing.base,
    },
    headerTitle: {
      ...typography.sectionHeader,
      color: themeColors.text,
      textAlign: 'center',
    },
    cancelText: {
      ...typography.secondary,
      color: themeColors.primary,
    },
    title: {
      ...typography.sectionHeader,
      color: themeColors.text,
    },
    infoIcon: {
      fontSize: 20,
      color: themeColors.primary,
    },
    content: {
      flex: 1,
      padding: spacing.base,
      backgroundColor: themeColors.background,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.caption,
      color: themeColors.lightText,
      textTransform: 'uppercase',
      marginBottom: spacing.md,
      fontWeight: '600',
    },
    alertTypePill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: themeColors.border,
      marginRight: spacing.sm,
      backgroundColor: themeColors.white,
    },
    selectedPill: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
    },
    alertTypeText: {
      ...typography.buttonLarge,
      color: themeColors.text,
    },
    selectedPillText: {
      color: themeColors.white,
    },
    messageInput: {
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: 12,
      padding: spacing.base,
      minHeight: 180,
      ...typography.body,
      textAlignVertical: 'top',
      backgroundColor: themeColors.white,
      color: themeColors.text,
    },
    charCount: {
      ...typography.caption,
      textAlign: 'right',
      marginTop: spacing.xs,
      color: themeColors.lightText,
    },
    templatePill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: themeColors.border,
      backgroundColor: themeColors.white,
      marginRight: spacing.sm,
    },
    selectedTemplatePill: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
    },
    templateText: {
      ...typography.secondary,
      color: themeColors.text,
    },
    selectedTemplateText: {
      color: themeColors.white,
      fontWeight: '600',
    },
    footer: {
      padding: spacing.base,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      backgroundColor: themeColors.lightGrayBg,
    },
    footerCancel: {
      ...typography.secondary,
      textAlign: 'center',
      color: themeColors.lightText,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    addTemplateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 8,
      gap: 4,
    },
    addTemplateText: {
      ...typography.secondary,
      fontSize: 14,
      fontWeight: '600',
    },
    templateContainer: {
      position: 'relative',
      marginRight: spacing.sm,
    },
    deleteTemplateButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: themeColors.white,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border,
      zIndex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: themeColors.background,
      borderRadius: 16,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      backgroundColor: themeColors.lightGrayBg,
    },
    modalTitle: {
      ...typography.sectionHeader,
      color: themeColors.text,
    },
    modalBody: {
      padding: spacing.base,
      gap: spacing.md,
    },
    modalInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: spacing.sm,
      ...typography.body,
      marginBottom: spacing.md,
    },
    modalTextArea: {
      borderWidth: 1,
      borderRadius: 8,
      padding: spacing.sm,
      minHeight: 100,
      ...typography.body,
      textAlignVertical: 'top',
    },
    modalFooter: {
      flexDirection: 'row',
      padding: spacing.base,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      gap: spacing.sm,
      backgroundColor: themeColors.lightGrayBg,
    },
    modalCancelButton: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCancelText: {
      ...typography.buttonLarge,
      fontWeight: '600',
    },
    modalSaveButton: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSaveText: {
      ...typography.buttonLarge,
      fontWeight: '600',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <BroadcastProgressModal
        visible={showProgress}
        progress={broadcastProgress}
        totalUsers={totalUsers}
        onCancel={() => {
          setShowProgress(false);
          setBroadcastProgress(0);
        }}
      />
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.headerLeft}>
          <Text style={dynamicStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{isEditMode ? 'UPDATE ALERT' : 'SEND ALERT'}</Text>
      </View>

      <ScrollView style={dynamicStyles.content}>
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>ALERT TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {alertTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  dynamicStyles.alertTypePill,
                  alertType === type.key && dynamicStyles.selectedPill,
                ]}
                onPress={() => setAlertType(type.key)}
              >
                <Icon
                  name={type.icon}
                  size={20}
                  color={alertType === type.key ? themeColors.white : themeColors.text}
                  style={styles.alertTypeIcon}
                />
                <Text
                  style={[
                    dynamicStyles.alertTypeText,
                    alertType === type.key && dynamicStyles.selectedPillText,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>MESSAGE</Text>
          <TextInput
            style={dynamicStyles.messageInput}
            placeholder="Type your message"
            placeholderTextColor={themeColors.mediumGray}
            multiline
            numberOfLines={8}
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              // Clear selected template if user manually edits the message
              if (selectedTemplate && text !== quickTemplates.find(t => t.id === selectedTemplate)?.message) {
                setSelectedTemplate(null);
                setPreviousMessage('');
              }
            }}
            maxLength={500}
          />
          <Text style={dynamicStyles.charCount}>{message.length} / 500</Text>
        </View>

        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeaderRow}>
            <Text style={dynamicStyles.sectionTitle}>QUICK TEMPLATES</Text>
            <TouchableOpacity
              style={dynamicStyles.addTemplateButton}
              onPress={() => setShowAddTemplateModal(true)}
            >
              <Icon name="add" size={20} color={themeColors.primary} />
              <Text style={[dynamicStyles.addTemplateText, { color: themeColors.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  dynamicStyles.templatePill,
                  selectedTemplate === template.id && dynamicStyles.selectedTemplatePill,
                ]}
                onPress={() => {
                  // If clicking the same template that's already selected, deselect it
                  if (selectedTemplate === template.id) {
                    setSelectedTemplate(null);
                    // Restore previous message if available, otherwise clear
                    setMessage(previousMessage || '');
                    setPreviousMessage('');
                  } else {
                    // Save current message before applying template
                    setPreviousMessage(message);
                    setMessage(template.message);
                    setSelectedTemplate(template.id);
                  }
                }}
              >
                <Text
                  style={[
                    dynamicStyles.templateText,
                    selectedTemplate === template.id && dynamicStyles.selectedTemplateText,
                  ]}
                >
                  {template.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={dynamicStyles.footer}>
        <Button
          title={isEditMode ? "UPDATE ALERT" : "SEND BROADCAST"}
          onPress={handleSend}
          variant="primary"
          style={styles.sendButton}
          icon={!isEditMode ? <Text style={styles.sendIcon}>✈️</Text> : undefined}
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={dynamicStyles.footerCancel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Add Template Modal - Simple */}
      <Modal
        visible={showAddTemplateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddTemplateModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Add Template</Text>
              <TouchableOpacity onPress={() => {
                setShowAddTemplateModal(false);
                setNewTemplateLabel('');
                setNewTemplateMessage('');
              }}>
                <Icon name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.modalBody}>
              <TextInput
                style={[dynamicStyles.modalInput, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.white }]}
                placeholder="Template name"
                placeholderTextColor={themeColors.mediumGray}
                value={newTemplateLabel}
                onChangeText={setNewTemplateLabel}
                maxLength={50}
              />

              <TextInput
                style={[dynamicStyles.modalTextArea, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.white }]}
                placeholder="Template message"
                placeholderTextColor={themeColors.mediumGray}
                multiline
                numberOfLines={5}
                value={newTemplateMessage}
                onChangeText={setNewTemplateMessage}
                maxLength={500}
              />
            </View>

            <View style={dynamicStyles.modalFooter}>
              <TouchableOpacity
                style={[dynamicStyles.modalCancelButton, { borderColor: themeColors.border }]}
                onPress={() => {
                  setShowAddTemplateModal(false);
                  setNewTemplateLabel('');
                  setNewTemplateMessage('');
                }}
              >
                <Text style={[dynamicStyles.modalCancelText, { color: themeColors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalSaveButton, { backgroundColor: themeColors.primary }]}
                onPress={async () => {
                  if (!newTemplateLabel.trim() || !newTemplateMessage.trim()) {
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: 'Please fill in both fields',
                    });
                    return;
                  }

                  const newTemplate = {
                    id: `custom_${Date.now()}`,
                    label: newTemplateLabel.trim(),
                    message: newTemplateMessage.trim(),
                    isCustom: true,
                  };

                  const updated = [...customTemplates, newTemplate];
                  setCustomTemplates(updated);
                  await AsyncStorage.setItem('custom_alert_templates', JSON.stringify(updated));

                  Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Template added',
                  });

                  setShowAddTemplateModal(false);
                  setNewTemplateLabel('');
                  setNewTemplateMessage('');
                }}
              >
                <Text style={[dynamicStyles.modalSaveText, { color: themeColors.white }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  cancelText: {
    ...typography.secondary,
    color: colors.primary,
  },
  title: {
    ...typography.sectionHeader,
  },
  infoIcon: {
    fontSize: 20,
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  infoBanner: {
    backgroundColor: colors.badgeBlueBg,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.secondary,
    color: colors.secondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.lightText,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  alertTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.borderGray,
    marginRight: spacing.sm,
  },
  selectedPill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  alertTypeIcon: {
    marginRight: spacing.xs,
  },
  alertTypeText: {
    ...typography.buttonLarge,
    color: colors.darkText,
  },
  selectedPillText: {
    color: colors.white,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    padding: spacing.base,
    minHeight: 180,
    ...typography.body,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  requiredText: {
    ...typography.caption,
    color: colors.emergencyRed || '#FF0000',
    marginTop: spacing.xs,
    fontSize: 12,
  },
  templatePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderGray,
    backgroundColor: colors.white,
    marginRight: spacing.sm,
  },
  selectedTemplatePill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  templateText: {
    ...typography.secondary,
    color: colors.darkText,
  },
  selectedTemplateText: {
    color: colors.white,
    fontWeight: '600',
  },
  recipientsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
    marginBottom: spacing.md,
  },
  recipientsIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  recipientsInfo: {
    flex: 1,
  },
  recipientsTitle: {
    ...typography.cardTitle,
    marginBottom: spacing.xs,
  },
  recipientsSubtitle: {
    ...typography.caption,
    color: colors.lightText,
  },
  priorityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  priorityLeft: {
    flex: 1,
  },
  priorityTitle: {
    ...typography.secondary,
    marginBottom: spacing.xs,
  },
  prioritySubtitle: {
    ...typography.caption,
    color: colors.lightText,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  sendButton: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  sendIcon: {
    fontSize: 18,
  },
  footerCancel: {
    ...typography.secondary,
    textAlign: 'center',
    color: colors.lightText,
  },
});

