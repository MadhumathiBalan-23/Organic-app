import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Sprout,
  FileText,
  Building,
  CreditCard,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  X,
  Upload,
  Navigation,
  Check,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { vendorService, bannerService, customerService } from '../../services';
import { getDeviceCurrentLocation } from '../../services/location.service';

export interface VendorRegistrationScreenProps {
  userPhone?: string;
  customerName?: string;
  customerEmail?: string;
  customerLocation?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const VendorRegistrationScreen: React.FC<VendorRegistrationScreenProps> = ({
  userPhone = '',
  customerName = '',
  customerEmail = '',
  customerLocation = '',
  onBack,
  onSuccess,
}) => {
  // ── Multi-Step State (1: Basic Info, 2: GST & Brand Logo, 3: Bank Details) ──
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // ── Step 1 Form: Basic Information (Pre-filled from Customer profile) ──
  const [applicantName, setApplicantName] = useState(customerName || '');
  const [applicantPhone, setApplicantPhone] = useState(userPhone || '');
  const [applicantEmail, setApplicantEmail] = useState(customerEmail || '');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState(customerLocation || '');
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsVerified, setGpsVerified] = useState(false);
  const [cropCategories, setCropCategories] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [experienceYears, setExperienceYears] = useState('');

  // Dynamic Categories from database
  useEffect(() => {
    customerService.getCategories().then((cats) => {
      if (Array.isArray(cats) && cats.length > 0) {
        const names = cats.map(c => c.name).filter(Boolean);
        setAvailableCategories(names);
        if (!cropCategories && names.length > 0) {
          setCropCategories(names[0]);
        }
      } else {
        setAvailableCategories(['Vegetables', 'Fruits', 'Dairy & Pure Ghee', 'Groceries & Cold-pressed Oils']);
      }
    }).catch(() => {
      setAvailableCategories(['Vegetables', 'Fruits', 'Dairy & Pure Ghee', 'Groceries & Cold-pressed Oils']);
    });
  }, []);

  // GPS Location Handler
  const handleFetchGPSLocation = async () => {
    setIsLocatingGPS(true);
    setErrorMsg(null);
    try {
      const res = await getDeviceCurrentLocation();
      const detectedAddress = res.areaLabel || (res.city ? `${res.city}, ${res.state || ''}` : '');
      if (res.success && detectedAddress) {
        setFarmLocation(detectedAddress);
        setGpsVerified(true);
      } else {
        Alert.alert('GPS Location', res.error || 'Could not fetch GPS location. Please enter your location manually.');
      }
    } catch {
      Alert.alert('GPS Error', 'Failed to retrieve location. Please type manually.');
    } finally {
      setIsLocatingGPS(false);
    }
  };

  // ── Step 2 Form: GST & Farm Logo / Photo (Optional) ──
  const [gstNumber, setGstNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // ── Step 3 Form: Bank Account Details (For Direct Farmer Payouts) ──
  const [accountHolderName, setAccountHolderName] = useState(customerName || '');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // ── Submission State ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Logo / Photo selection
  const handlePickLogo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow gallery access to upload your farm/brand logo.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setIsUploadingLogo(true);
        const asset = res.assets[0];
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const uploadedUrl = await bannerService.uploadImage(dataUri, `vendor-logo-${Date.now()}.jpg`);
        setLogoUrl(uploadedUrl);
      }
    } catch {
      Alert.alert('Upload Error', 'Could not upload photo. You can submit without a logo and add it later.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleTakeLogoPhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to take a farm logo photo.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setIsUploadingLogo(true);
        const asset = res.assets[0];
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const uploadedUrl = await bannerService.uploadImage(dataUri, `vendor-logo-${Date.now()}.jpg`);
        setLogoUrl(uploadedUrl);
      }
    } catch {
      Alert.alert('Camera Error', 'Could not take photo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Step 1 Validation
  const handleNextStep1 = () => {
    setErrorMsg(null);
    const cleanPhone = applicantPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes('@') || !applicantEmail.includes('.')) {
      setErrorMsg('Valid Gmail / Email address is mandatory for official correspondence.');
      return;
    }
    if (!applicantName.trim() || applicantName.trim().length < 2) {
      setErrorMsg('Please enter applicant or farmer name.');
      return;
    }
    if (!farmName.trim() || farmName.trim().length < 2) {
      setErrorMsg('Please enter your Farm, Producer or Business name.');
      return;
    }
    if (!farmLocation.trim() || farmLocation.trim().length < 3) {
      setErrorMsg('Please enter farm location and district.');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation (GST and Logo are optional)
  const handleNextStep2 = () => {
    setErrorMsg(null);
    if (gstNumber.trim() && gstNumber.trim().length < 15) {
      setErrorMsg('GSTIN must be 15 alphanumeric characters if provided, or leave it blank.');
      return;
    }
    setCurrentStep(3);
  };

  // Final Submission
  const handleSubmitRegistration = async () => {
    setErrorMsg(null);
    if (!accountHolderName.trim()) {
      setErrorMsg('Please enter Bank Account Holder Name.');
      return;
    }
    if (!bankName.trim()) {
      setErrorMsg('Please enter Bank Name (e.g. SBI, HDFC, Canara Bank).');
      return;
    }
    if (!accountNumber.trim() || accountNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid Bank Account Number (at least 8 digits).');
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setErrorMsg('Account number and Confirm Account number do not match.');
      return;
    }
    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!cleanIfsc || cleanIfsc.length !== 11) {
      setErrorMsg('Please enter a valid 11-character IFSC code (e.g. SBIN0001234).');
      return;
    }

    const cleanPhone = applicantPhone.replace(/[^0-9]/g, '');
    setIsSubmitting(true);
    try {
      const payload = {
        phoneNumber: cleanPhone,
        userName: applicantName.trim(),
        email: applicantEmail.trim(),
        farmName: farmName.trim(),
        farmLocation: farmLocation.trim(),
        cropCategories: cropCategories.trim() || 'Organic Vegetables & Dairy',
        experienceYears: experienceYears.trim() || '3',
        gstNumber: gstNumber.trim().toUpperCase() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: cleanIfsc,
      };

      const res = await vendorService.submitRequest(payload);
      if (res.success) {
        try {
          const g = globalThis as any;
          if (g.localStorage) g.localStorage.setItem('agriflow_vendor_applied_' + cleanPhone, 'true');
          else if (g.window?.localStorage) g.window.localStorage.setItem('agriflow_vendor_applied_' + cleanPhone, 'true');
        } catch {}
        Alert.alert(
          'Application Submitted Successfully! 🎉',
          `Your vendor application for "${farmName.trim()}" (+91 ${cleanPhone}) has been submitted to Admin with bank & GST details. Once approved, your Vendor Console will unlock automatically.`
        );
        onSuccess();
      } else {
        setErrorMsg(res.message || 'Submission failed. Please try again.');
      }
    } catch {
      try {
        const g = globalThis as any;
        if (g.localStorage) g.localStorage.setItem('agriflow_vendor_applied_' + cleanPhone, 'true');
        else if (g.window?.localStorage) g.window.localStorage.setItem('agriflow_vendor_applied_' + cleanPhone, 'true');
      } catch {}
      Alert.alert(
        'Application Recorded',
        'Your registration details have been saved. Admin will verify your farm and activate vendor privileges.'
      );
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F9FAF9]">
      {/* ── Top Progress Header ── */}
      <View className="bg-[#07843D] px-4 pt-3 pb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          {currentStep > 1 ? (
            <TouchableOpacity
              onPress={() => setCurrentStep((currentStep - 1) as any)}
              className="w-9 h-9 rounded-full bg-white/15 items-center justify-center active:bg-white/25"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowLeft size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View className="w-9 h-9" />
          )}
          <View className="items-center flex-1 mx-2">
            <Text className="text-white text-base font-black">Farmer Partner Registration</Text>
            <Text className="text-emerald-100 text-[11px] font-semibold">Step {currentStep} of 3</Text>
          </View>
          <TouchableOpacity
            onPress={onBack}
            className="w-9 h-9 rounded-full bg-white/15 items-center justify-center active:bg-white/25"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 3-Step Pill Bar */}
        <View className="flex-row items-center justify-between gap-2 mt-1">
          <View className="flex-1">
            <View className={`h-1.5 rounded-full ${currentStep >= 1 ? 'bg-amber-300' : 'bg-white/20'}`} />
            <Text className={`text-[10px] font-bold mt-1 text-center ${currentStep === 1 ? 'text-amber-200' : 'text-white/60'}`}>
              1. Basic Info
            </Text>
          </View>
          <View className="flex-1">
            <View className={`h-1.5 rounded-full ${currentStep >= 2 ? 'bg-amber-300' : 'bg-white/20'}`} />
            <Text className={`text-[10px] font-bold mt-1 text-center ${currentStep === 2 ? 'text-amber-200' : 'text-white/60'}`}>
              2. GST & Logo
            </Text>
          </View>
          <View className="flex-1">
            <View className={`h-1.5 rounded-full ${currentStep >= 3 ? 'bg-amber-300' : 'bg-white/20'}`} />
            <Text className={`text-[10px] font-bold mt-1 text-center ${currentStep === 3 ? 'text-amber-200' : 'text-white/60'}`}>
              3. Bank Details
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="always"
      >
        {/* Error Banner */}
        {errorMsg ? (
          <View className="bg-rose-50 border border-rose-200 p-3 rounded-2xl mb-3 flex-row items-center gap-2">
            <Text className="text-xs font-bold text-rose-700 flex-1">{errorMsg}</Text>
          </View>
        ) : null}

        {/* ═════════════════════════════════════════════════════════
            STEP 1: BASIC INFORMATION (Customer data pre-filled)
           ═════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <View>
            <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-4 flex-row items-center gap-2.5">
              <CheckCircle2 size={18} color="#07843D" />
              <Text className="text-xs text-emerald-950 font-semibold flex-1 leading-4">
                Your registered customer information has been auto-filled below. Please verify and complete farm details.
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-3.5">
              <Text className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                Farmer / Applicant Identity
              </Text>

              {/* Applicant Name */}
              <Text className="text-xs font-bold text-slate-700 mb-1">Full Name *</Text>
              <View className="flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11 mb-3">
                <User size={16} color="#64748B" />
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-2 font-medium"
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  value={applicantName}
                  onChangeText={setApplicantName}
                />
              </View>

              {/* Registered Mobile Number */}
              <Text className="text-xs font-bold text-slate-700 mb-1">Registered Mobile Number *</Text>
              <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-3 h-11 mb-3">
                <Phone size={16} color="#64748B" />
                <Text className="text-sm font-bold text-slate-500 ml-2">+91</Text>
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-1.5 font-bold"
                  placeholder="10-digit mobile"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={applicantPhone}
                  onChangeText={setApplicantPhone}
                />
              </View>

              {/* Gmail / Email Address (Mandatory) */}
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-bold text-slate-700">Gmail / Email Address *</Text>
                <Text className="text-[10px] font-bold text-emerald-700">Mandatory</Text>
              </View>
              <View className="flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11 mb-1">
                <Mail size={16} color="#64748B" />
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-2 font-medium"
                  placeholder="e.g. farmer.mathira@gmail.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={applicantEmail}
                  onChangeText={setApplicantEmail}
                />
              </View>
              <Text className="text-[10px] text-slate-400 font-medium mb-3">
                Order alerts, weekly payout reports, and verification documents will be sent to this email.
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-3.5">
              <Text className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                Farm & Agricultural Details
              </Text>

              {/* Farm / Producer Name */}
              <Text className="text-xs font-bold text-slate-700 mb-1">Farm / Producer Name *</Text>
              <View className="flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11 mb-3">
                <Store size={16} color="#64748B" />
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-2 font-medium"
                  placeholder="e.g. Mathira Agro Farm / Green Valley Organics"
                  placeholderTextColor="#94A3B8"
                  value={farmName}
                  onChangeText={setFarmName}
                />
              </View>

              {/* Farm Location / District (Increased height & width + GPS Location fetch + Manual Entry) */}
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-xs font-bold text-slate-700">Farm Location & District *</Text>
                <TouchableOpacity
                  onPress={handleFetchGPSLocation}
                  disabled={isLocatingGPS}
                  className="flex-row items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 active:bg-emerald-100"
                >
                  {isLocatingGPS ? (
                    <ActivityIndicator size="small" color="#07843D" />
                  ) : (
                    <Navigation size={12} color="#07843D" />
                  )}
                  <Text className="text-[11px] font-bold text-emerald-800">
                    {isLocatingGPS ? 'Detecting GPS...' : 'Use My GPS'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="bg-[#F8FAF8] border border-slate-200 rounded-2xl px-3.5 py-3 mb-2 min-h-[72px] justify-center">
                <View className="flex-row items-start">
                  <MapPin size={18} color={gpsVerified ? '#07843D' : '#64748B'} style={{ marginTop: 2 }} />
                  <TextInput
                    className="flex-1 text-sm text-slate-800 ml-2.5 font-medium leading-5"
                    placeholder="Enter or detect your farm address, district, state..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={farmLocation}
                    onChangeText={(val) => {
                      setFarmLocation(val);
                      setGpsVerified(false);
                    }}
                  />
                  {farmLocation ? (
                    <TouchableOpacity
                      onPress={() => setFarmLocation('')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      className="p-1"
                    >
                      <X size={15} color="#94A3B8" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              {gpsVerified ? (
                <View className="flex-row items-center gap-1.5 mb-3 px-1">
                  <CheckCircle2 size={13} color="#07843D" />
                  <Text className="text-[11px] font-bold text-emerald-700">GPS Verified Coordinates Attached</Text>
                </View>
              ) : (
                <Text className="text-[10px] text-slate-400 font-medium mb-3 px-1">
                  Tap 'Use My GPS' to auto-detect farm coordinates or type manual address above.
                </Text>
              )}

              {/* Crop / Harvest Category (Dynamic Admin Category Dropdown) */}
              <Text className="text-xs font-bold text-slate-700 mb-1">Crop / Harvest Category *</Text>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-12 mb-3.5"
                onPress={() => setShowCategoryPicker(true)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <Sprout size={16} color="#07843D" />
                  <Text className={`text-sm ml-2.5 ${cropCategories ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'}`}>
                    {cropCategories || 'Select crop category'}
                  </Text>
                </View>
                <ChevronDown size={18} color="#64748B" />
              </TouchableOpacity>

              {/* Farming Experience (Certificate field cleanly removed as requested) */}
              <View className="mb-2">
                <Text className="text-xs font-bold text-slate-700 mb-1">Farming Experience (Years) *</Text>
                <TextInput
                  className="bg-[#F8FAF8] border border-slate-200 rounded-xl px-3.5 h-11 text-sm text-slate-800 font-medium"
                  placeholder="e.g. 5"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                />
              </View>
            </View>

            <Pressable
              onPress={handleNextStep1}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#046A31' : '#07843D',
                paddingVertical: 14,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                elevation: 3,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                Continue to Step 2: GST & Logo →
              </Text>
            </Pressable>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════
            STEP 2: GST & FARM / PRODUCER LOGO (Optional)
           ═════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <View>
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-3.5">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Goods & Services Tax (GSTIN)
                </Text>
                <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                  <Text className="text-[10px] font-bold text-slate-500">Optional for Micro-Farmers</Text>
                </View>
              </View>
              <Text className="text-xs text-slate-500 mb-3 leading-4">
                If you have a registered GSTIN for your farm or producer society, provide it below for B2B invoice generation.
              </Text>

              <View className="flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11 mb-1">
                <FileText size={16} color="#64748B" />
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-2 font-bold tracking-wider"
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  maxLength={15}
                  value={gstNumber}
                  onChangeText={setGstNumber}
                />
              </View>
              <Text className="text-[10px] text-slate-400 font-medium">
                15-character official GSTIN number. Leave empty if exempted or individual grower.
              </Text>
            </View>

            {/* Farm Brand Logo Upload */}
            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Farm Brand Logo / Farm Photo
                </Text>
                <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                  <Text className="text-[10px] font-bold text-slate-500">Optional</Text>
                </View>
              </View>
              <Text className="text-xs text-slate-500 mb-3 leading-4">
                Display your certified organic logo or farm identity on product cards to build customer trust.
              </Text>

              {logoUrl ? (
                <View className="items-center mb-3">
                  <View className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-400 relative shadow-sm">
                    <Image source={{ uri: logoUrl }} className="w-full h-full" resizeMode="cover" />
                    <TouchableOpacity
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 items-center justify-center"
                      onPress={() => setLogoUrl('')}
                    >
                      <X size={12} color="#FFFFFF" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-2xs text-emerald-800 font-bold mt-1.5">✓ Farm Logo Attached</Text>
                </View>
              ) : (
                <View className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-300 items-center justify-center bg-[#F8FAF8] mb-3">
                  <ImageIcon size={28} color="#94A3B8" />
                  <Text className="text-xs text-slate-400 font-semibold mt-1">No Logo Selected (Optional)</Text>
                </View>
              )}

              <View className="flex-row gap-2.5">
                <TouchableOpacity
                  className="flex-1 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80 items-center justify-center flex-row gap-1.5 active:bg-emerald-100"
                  onPress={handlePickLogo}
                  disabled={isUploadingLogo}
                >
                  <Upload size={14} color="#07843D" />
                  <Text className="text-xs font-bold text-emerald-800">
                    {isUploadingLogo ? 'Uploading...' : 'Choose from Gallery'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white items-center justify-center flex-row gap-1.5 active:bg-slate-50"
                  onPress={handleTakeLogoPhoto}
                  disabled={isUploadingLogo}
                >
                  <Camera size={14} color="#475569" />
                  <Text className="text-xs font-bold text-slate-700">Take Photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setCurrentStep(1)}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#CBD5E1',
                  backgroundColor: pressed ? '#F1F5F9' : '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Text style={{ color: '#475569', fontSize: 14, fontWeight: '700' }}>← Back</Text>
              </Pressable>

              <Pressable
                onPress={handleNextStep2}
                style={({ pressed }) => ({
                  flex: 1.8,
                  backgroundColor: pressed ? '#046A31' : '#07843D',
                  paddingVertical: 14,
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  elevation: 3,
                })}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                  Next: Bank Account →
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════
            STEP 3: BANK DETAILS FOR WEEKLY/MONTHLY PAYOUTS
           ═════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <View>
            <View className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex-row items-center gap-2.5">
              <CreditCard size={18} color="#B45309" />
              <Text className="text-xs text-amber-950 font-semibold flex-1 leading-4">
                Automated customer order payouts are credited directly to this verified bank account on a scheduled weekly cycle.
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-4">
              <Text className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                Farmer Payout Account Details
              </Text>

              {/* Account Holder Name */}
              <Text className="text-xs font-bold text-slate-700 mb-1">Account Holder Name *</Text>
              <View className="flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11 mb-3">
                <User size={16} color="#64748B" />
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-2 font-medium"
                  placeholder="As per bank passbook / cheque"
                  placeholderTextColor="#94A3B8"
                  value={accountHolderName}
                  onChangeText={setAccountHolderName}
                />
              </View>

              {/* Bank Name */}
              <Text className="text-xs font-bold text-slate-700 mb-1">Bank Name *</Text>
              <View className="flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11 mb-3">
                <Building size={16} color="#64748B" />
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-2 font-medium"
                  placeholder="e.g. State Bank of India / HDFC Bank"
                  placeholderTextColor="#94A3B8"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              {/* Account Number */}
              <Text className="text-xs font-bold text-slate-700 mb-1">Account Number *</Text>
              <View className="flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11 mb-3">
                <CreditCard size={16} color="#64748B" />
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-2 font-bold tracking-wider"
                  placeholder="Enter bank account number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  secureTextEntry={false}
                />
              </View>

              {/* Confirm Account Number */}
              <Text className="text-xs font-bold text-slate-700 mb-1">Confirm Account Number *</Text>
              <View className="flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11 mb-3">
                <CreditCard size={16} color="#64748B" />
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-2 font-bold tracking-wider"
                  placeholder="Re-enter bank account number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={confirmAccountNumber}
                  onChangeText={setConfirmAccountNumber}
                />
              </View>

              {/* IFSC Code */}
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-bold text-slate-700">IFSC Code *</Text>
                <Text className="text-[10px] text-slate-400 font-semibold">11 Characters</Text>
              </View>
              <View className="flex-row items-center bg-[#F8FAF8] border border-slate-200 rounded-xl px-3 h-11 mb-1">
                <Building size={16} color="#64748B" />
                <TextInput
                  className="flex-1 text-sm text-slate-800 ml-2 font-black tracking-widest"
                  placeholder="e.g. SBIN0001234"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  maxLength={11}
                  value={ifscCode}
                  onChangeText={setIfscCode}
                />
              </View>
              <Text className="text-[10px] text-slate-400 font-medium">
                Found on your cheque leaf or bank passbook front page.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setCurrentStep(2)}
                disabled={isSubmitting}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#CBD5E1',
                  backgroundColor: pressed ? '#F1F5F9' : '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Text style={{ color: '#475569', fontSize: 14, fontWeight: '700' }}>← Back</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmitRegistration}
                disabled={isSubmitting}
                style={({ pressed }) => ({
                  flex: 2,
                  backgroundColor: pressed ? '#046A31' : '#07843D',
                  paddingVertical: 14,
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  elevation: 4,
                  opacity: isSubmitting ? 0.75 : 1,
                })}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <CheckCircle2 size={18} color="#FFFFFF" />
                )}
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                  {isSubmitting ? 'Submitting Application...' : 'Submit Registration'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Category Dropdown Selection Modal */}
      <Modal visible={showCategoryPicker} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <View>
                <Text className="text-base font-extrabold text-slate-800">Select Crop Category</Text>
                <Text className="text-xs text-slate-500">Loaded dynamically from Admin panel</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {availableCategories.map((cat) => {
                const isSelected = cropCategories === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    className={`flex-row items-center justify-between p-3.5 rounded-xl mb-2 border ${
                      isSelected ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                    }`}
                    onPress={() => {
                      setCropCategories(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <Sprout size={16} color={isSelected ? '#07843D' : '#64748B'} />
                      <Text className={`text-sm ${isSelected ? 'font-black text-emerald-900' : 'font-medium text-slate-700'}`}>
                        {cat}
                      </Text>
                    </View>
                    {isSelected && <Check size={16} color="#07843D" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VendorRegistrationScreen;
