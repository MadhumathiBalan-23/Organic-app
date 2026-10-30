import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  X,
  Laptop,
  CheckCircle2,
  LogOut,
  RefreshCw,
} from 'lucide-react-native';
import { authService, UserDeviceItem } from '../services/auth.service';
import { deviceService } from '../services/device.service';

interface DeviceManagementModalProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onLogoutAll?: () => void;
}

export const DeviceManagementModal: React.FC<DeviceManagementModalProps> = ({
  visible,
  userId,
  onClose,
  onLogoutAll,
}) => {
  const [devices, setDevices] = useState<UserDeviceItem[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const curId = await deviceService.getDeviceId();
      setCurrentDeviceId(curId);
      const list = await authService.getMyDevices(userId);
      setDevices(list);
    } catch (err: any) {
      console.warn('Could not load devices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible && userId) {
      loadDevices();
    }
  }, [visible, userId]);

  const handleRevokeTrust = async (device: UserDeviceItem) => {
    Alert.alert(
      'Revoke Device Trust?',
      `Are you sure you want to revoke trust for "${device.deviceName || device.deviceId}"? Next time this device opens the app, it will require full SMS OTP verification.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Trust',
          style: 'destructive',
          onPress: async () => {
            setActionLoadingId(device.deviceId);
            try {
              await authService.revokeDeviceTrust(device.deviceId, userId);
              await loadDevices();
              Alert.alert('Trust Revoked', `Trust has been revoked for ${device.deviceName}.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not revoke device trust.');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleDeleteDevice = async (device: UserDeviceItem) => {
    Alert.alert(
      'Remove Device Session?',
      `Remove "${device.deviceName || device.deviceId}" from your account? If this device was lost or stolen, its active sessions will be terminated immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Device',
          style: 'destructive',
          onPress: async () => {
            setActionLoadingId(device.deviceId);
            try {
              await authService.deleteDevice(device.deviceId, userId);
              await loadDevices();
              Alert.alert('Device Removed', 'Device session has been deactivated.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete device.');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%] p-5 pb-8 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
            <View className="flex-row items-center gap-2.5">
              <View className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 items-center justify-center">
                <Smartphone size={20} color="#047857" />
              </View>
              <View>
                <Text className="text-lg font-black text-slate-900">Trusted Devices</Text>
                <Text className="text-xs text-slate-500 font-medium">
                  Manage your active and trusted app installations
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Device List */}
          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#047857" />
              <Text className="text-xs text-slate-500 font-semibold mt-3">
                Fetching registered devices...
              </Text>
            </View>
          ) : (
            <ScrollView className="mt-3.5 max-h-[420px]" showsVerticalScrollIndicator={false}>
              {devices.length === 0 ? (
                <View className="py-10 items-center">
                  <ShieldCheck size={36} color="#94A3B8" />
                  <Text className="text-sm font-bold text-slate-600 mt-2">No other devices found</Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    This phone is the only registered device for this account.
                  </Text>
                </View>
              ) : (
                devices.map((device) => {
                  const isCurrent = device.deviceId === currentDeviceId;
                  const isBusy = actionLoadingId === device.deviceId;

                  return (
                    <View
                      key={device.id}
                      className={`p-3.5 rounded-2xl border mb-3 ${
                        isCurrent
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-row items-center gap-3 flex-1 pr-2">
                          <View
                            className={`w-10 h-10 rounded-xl items-center justify-center ${
                              isCurrent ? 'bg-emerald-700' : 'bg-slate-100'
                            }`}
                          >
                            {device.deviceType === 'web' ? (
                              <Laptop size={20} color={isCurrent ? '#FFFFFF' : '#475569'} />
                            ) : (
                              <Smartphone size={20} color={isCurrent ? '#FFFFFF' : '#475569'} />
                            )}
                          </View>

                          <View className="flex-1">
                            <View className="flex-row items-center gap-1.5 flex-wrap">
                              <Text className="text-sm font-black text-slate-900" numberOfLines={1}>
                                {device.deviceName || device.deviceModel || 'Mobile Device'}
                              </Text>
                              {isCurrent && (
                                <View className="bg-emerald-700 px-2 py-0.5 rounded-md">
                                  <Text className="text-[10px] font-black text-white">THIS DEVICE</Text>
                                </View>
                              )}
                            </View>

                            <Text className="text-xs text-slate-500 font-medium mt-0.5" numberOfLines={1}>
                              {device.operatingSystem} {device.osVersion || ''} · App v{device.appVersion || '1.0.0'}
                            </Text>

                            <Text className="text-[11px] text-slate-400 mt-0.5">
                              Last active: {new Date(device.lastLoginAt).toLocaleDateString()} {new Date(device.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>

                        {/* Status Badge */}
                        <View className="items-end">
                          {device.isTrusted ? (
                            <View className="flex-row items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <ShieldCheck size={12} color="#047857" />
                              <Text className="text-[10px] font-black text-emerald-800">TRUSTED</Text>
                            </View>
                          ) : (
                            <View className="flex-row items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full">
                              <ShieldAlert size={12} color="#D97706" />
                              <Text className="text-[10px] font-black text-amber-800">UNTRUSTED</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Device Action Buttons (for non-current or untrusted devices) */}
                      {!isCurrent && (
                        <View className="flex-row items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-100">
                          {device.isTrusted && (
                            <TouchableOpacity
                              onPress={() => handleRevokeTrust(device)}
                              disabled={isBusy}
                              className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 flex-row items-center gap-1"
                              activeOpacity={0.7}
                            >
                              <ShieldAlert size={12} color="#D97706" />
                              <Text className="text-xs font-bold text-amber-800">Revoke Trust</Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            onPress={() => handleDeleteDevice(device)}
                            disabled={isBusy}
                            className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 flex-row items-center gap-1"
                            activeOpacity={0.7}
                          >
                            <Trash2 size={12} color="#EF4444" />
                            <Text className="text-xs font-bold text-red-700">Remove</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}

          {/* Footer Actions */}
          <View className="mt-4 pt-3 border-t border-slate-100 flex-row items-center gap-2">
            <TouchableOpacity
              onPress={loadDevices}
              className="p-3 rounded-2xl bg-slate-100 items-center justify-center"
              activeOpacity={0.7}
            >
              <RefreshCw size={18} color="#475569" />
            </TouchableOpacity>

            {onLogoutAll && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Log Out All Devices?',
                    'This will revoke all active sessions across all phones, tablets and browsers. You will need to verify OTP to log in again.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Log Out Everywhere',
                        style: 'destructive',
                        onPress: onLogoutAll,
                      },
                    ]
                  );
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-50 border border-red-200 flex-row items-center justify-center gap-2 active:bg-red-100"
                activeOpacity={0.8}
              >
                <LogOut size={16} color="#DC2626" />
                <Text className="text-xs font-black text-red-700">Log Out From All Devices</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
