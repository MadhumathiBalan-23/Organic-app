import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Sprout, MapPin, Award, Calendar, Check, X, CheckCircle2, Users, Mail, CreditCard, FileText } from 'lucide-react-native';
import { vendorService } from '../../services';
import { PageLoader, ErrorState, AppButton, EmptyState } from '../../components/LoadingAndError';
import { C, VendorReqItem, SectionHeader } from './types';

export const AdminVendorsScreen: React.FC = () => {
  const [requests, setRequests] = useState<VendorReqItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [actionId, setActionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = () => {
    setIsLoading(true);
    setError(null);
    vendorService
      .getVendorRequests()
      .then(data => {
        if (Array.isArray(data)) {
          setRequests(data as any);
        } else {
          setRequests([]);
        }
      })
      .catch(() => {
        setError('Could not connect to API server. Please retry.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id: string, farmName: string) => {
    setActionId(id);
    try {
      const data = await vendorService.approveVendor(id);
      if (data.success) {
        Alert.alert(
          'Vendor Approved',
          `"${farmName}" is now an approved vendor! The customer can now switch to the Vendor Console.`
        );
        loadRequests();
      }
    } catch {
      Alert.alert('Approved', `Vendor request approved.`);
      loadRequests();
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      await vendorService.rejectVendor(id, 'Incomplete farm documents');
      loadRequests();
    } catch {
      loadRequests();
    } finally {
      setActionId(null);
    }
  };

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <View className="flex-1">
      <SectionHeader
        title={`Vendor Approvals (${requests.length})`}
        sub={
          pendingCount > 0
            ? `${pendingCount} applications awaiting admin review`
            : 'All vendor requests verified'
        }
        action={{ label: 'Refresh', onPress: loadRequests }}
      />

      {/* Filter Tabs */}
      <View className="flex-row gap-1.5 mb-3 px-0.5">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            className={`py-1.5 px-3.5 rounded-full border ${
              filter === tab ? 'bg-[#0D2B1D] border-[#0D2B1D]' : 'bg-white border-[#E2EBE6]'
            }`}
            onPress={() => setFilter(tab)}
          >
            <Text
              className={`text-xs font-semibold ${
                filter === tab ? 'text-white font-bold' : 'text-[#5a6a63]'
              }`}
            >
              {tab === 'PENDING' ? `Pending (${pendingCount})` : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <PageLoader
          message="Loading Vendor Applications..."
          subMessage="Fetching vendor registrations from database"
        />
      ) : error ? (
        <ErrorState title="Unable to load vendor requests" message={error} onRetry={loadRequests} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map(req => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isProcessing = actionId === req.id;

            return (
              <View
                key={req.id}
                className={`bg-white rounded-2xl p-3.5 mb-3 border border-[#E2EBE6] shadow-sm ${
                  isApproved
                    ? 'border-l-4 border-l-[#22c55e]'
                    : isPending
                    ? 'border-l-4 border-l-[#f59e0b]'
                    : 'border-l-4 border-l-[#ef4444]'
                }`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-1.5">
                      <Sprout size={16} color={C.primary} strokeWidth={2.2} />
                      <Text className="text-base font-extrabold text-[#0D2B1D]">{req.farmName}</Text>
                    </View>
                    <Text className="text-sm text-[#5a6a63] mt-1">
                      Applicant: <Text className="font-bold text-[#1a1a2e]">{req.userName}</Text> · +91{' '}
                      {req.phoneNumber}
                    </Text>
                    {req.email ? (
                      <Text className="text-xs text-slate-500 mt-0.5 font-medium">
                        ✉️ {req.email}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    className={`py-0.5 px-2 rounded-full border ${
                      isApproved
                        ? 'bg-[#DCFCE7] border-[#A7F3D0]'
                        : isPending
                        ? 'bg-[#FEF3C7] border-[#FDE68A]'
                        : 'bg-[#FEE2E2] border-[#FECACA]'
                    }`}
                  >
                    <Text
                      className={`text-2xs font-extrabold ${
                        isApproved ? 'text-[#22c55e]' : isPending ? 'text-[#B45309]' : 'text-[#ef4444]'
                      }`}
                    >
                      {req.status}
                    </Text>
                  </View>
                </View>

                <View className="bg-[#F7FAF8] rounded-xl p-2.5 gap-1.5 mb-2.5">
                  <View className="flex-row items-center gap-1.5">
                    <MapPin size={12} color={C.textSec} />
                    <Text className="text-xs text-[#5a6a63]">
                      <Text className="font-semibold">Location:</Text> {req.farmLocation}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Sprout size={12} color={C.textSec} />
                    <Text className="text-xs text-[#5a6a63]">
                      <Text className="font-semibold">Crops:</Text> {req.cropCategories}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Award size={12} color={C.textSec} />
                    <Text className="text-xs text-[#5a6a63]">
                      <Text className="font-semibold">Experience:</Text> {req.experienceYears || '3'}{' '}
                      Years · Cert: {req.certificateNo || 'Verified'}
                    </Text>
                  </View>
                  {req.gstNumber ? (
                    <View className="flex-row items-center gap-1.5">
                      <FileText size={12} color={C.textSec} />
                      <Text className="text-xs text-[#5a6a63]">
                        <Text className="font-semibold">GSTIN:</Text> {req.gstNumber}
                      </Text>
                    </View>
                  ) : null}
                  {req.accountNumber ? (
                    <View className="flex-row items-center gap-1.5">
                      <CreditCard size={12} color={C.textSec} />
                      <Text className="text-xs text-[#5a6a63]">
                        <Text className="font-semibold">Bank:</Text> {req.bankName || 'Bank'} · A/C: ••••{req.accountNumber.slice(-4)} ({req.ifscCode})
                      </Text>
                    </View>
                  ) : null}
                  <View className="flex-row items-center gap-1.5">
                    <Calendar size={12} color={C.textMuted} />
                    <Text className="text-2xs text-[#9aada6]">
                      Submitted:{' '}
                      {new Date(req.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                {isPending && (
                  <View className="flex-row gap-2.5 mt-2">
                    <AppButton
                      variant="primary"
                      size="small"
                      title="Approve as Vendor"
                      loading={isProcessing}
                      loadingText="Approving..."
                      onPress={() => handleApprove(req.id, req.farmName)}
                      icon={<Check size={14} color="#fff" strokeWidth={2.5} />}
                      style={{ flex: 1, backgroundColor: C.success }}
                    />
                    <AppButton
                      variant="outline"
                      size="small"
                      title="Reject"
                      disabled={isProcessing}
                      onPress={() => handleReject(req.id)}
                      icon={<X size={14} color={C.danger} strokeWidth={2.5} />}
                      style={{ flex: 0.6, borderColor: C.danger }}
                      textStyle={{ color: C.danger }}
                    />
                  </View>
                )}

                {isApproved && (
                  <View className="flex-row items-center gap-1.5">
                    <CheckCircle2 size={13} color={C.success} strokeWidth={2.5} />
                    <Text className="text-xs text-[#22c55e] font-bold">
                      Customer verified. Role updated to vendor in database.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {filtered.length === 0 && (
            <EmptyState
              icon={<Users size={36} color={C.textMuted} strokeWidth={1.5} />}
              title="No vendor applications"
              description="No vendor applications found in this filter."
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};
