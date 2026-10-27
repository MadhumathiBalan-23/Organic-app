import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { ShieldAlert, TriangleAlert, X } from 'lucide-react-native';
import { API_ENDPOINTS } from '../../../services';
import { AppButton } from '../../../components/LoadingAndError';

interface AdminPinModalProps {
  modalData: { open: boolean; cropId: string; cropName: string } | null;
  onClose: () => void;
  onDeleteSuccess: (cropId: string, cropName: string) => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  modalData,
  onClose,
  onDeleteSuccess,
}) => {
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isAuthorizingAdmin, setIsAuthorizingAdmin] = useState(false);

  const handleAdminAuthorizedDelete = async () => {
    if (!modalData) return;
    setAdminAuthError(null);

    if (adminPinInput.trim() !== '9999') {
      setAdminAuthError(
        'Invalid Admin Passcode. Only Super Admin has permission to delete crops.'
      );
      return;
    }

    setIsAuthorizingAdmin(true);
    try {
      const res = await fetch(
        `${API_ENDPOINTS.products}/${modalData.cropId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-pin': '9999',
          },
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        onDeleteSuccess(modalData.cropId, modalData.cropName);
        setAdminPinInput('');
        onClose();
      } else {
        setAdminAuthError(data.message || 'Server rejected deletion request.');
      }
    } catch {
      setAdminAuthError(
        'Network error connecting to Admin verification server.'
      );
    } finally {
      setIsAuthorizingAdmin(false);
    }
  };

  return (
    <Modal visible={!!modalData} transparent animationType="fade">
      <View className="flex-1 bg-black/55 justify-center items-center p-3.5">
        <View className="w-full max-w-[360px] bg-white rounded-2xl p-5 shadow-lg">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center gap-2">
              <ShieldAlert size={20} color="#DC2626" />
              <View>
                <Text className="text-base font-bold text-slate-900">
                  Admin Permission Required
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Super Admin Authorization
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="py-2">
            <View className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 mb-3">
              <Text className="text-sm text-rose-800 leading-4">
                Vendors do not have permission to delete listings from the
                catalog. Enter Super Admin Authorization PIN to confirm permanent
                removal of <Text className="font-bold">"{modalData?.cropName}"</Text>.
              </Text>
            </View>

            {adminAuthError && (
              <View className="flex-row items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-2 mb-3">
                <TriangleAlert size={14} color="#DC2626" />
                <Text className="text-xs text-rose-600 font-semibold">
                  {adminAuthError}
                </Text>
              </View>
            )}

            <Text className="text-xs font-bold text-slate-700 mb-1 mt-2">
              Admin Security Passcode (PIN)
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-lg text-slate-900 tracking-widest text-center"
              placeholder="••••"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              value={adminPinInput}
              onChangeText={setAdminPinInput}
            />
            <Text className="text-2xs text-slate-500 text-center mt-1">
              Master Admin Passcode: 9999
            </Text>

            <View className="flex-row gap-2.5 mt-4">
              <TouchableOpacity
                className="flex-1 bg-slate-100 rounded-xl py-3 items-center justify-center"
                onPress={onClose}
                disabled={isAuthorizingAdmin}
              >
                <Text className="text-sm font-bold text-slate-600">Cancel</Text>
              </TouchableOpacity>

              <AppButton
                variant="danger"
                title="Verify & Delete"
                loading={isAuthorizingAdmin}
                loadingText="Verifying..."
                onPress={handleAdminAuthorizedDelete}
                className="flex-[1.5]"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
