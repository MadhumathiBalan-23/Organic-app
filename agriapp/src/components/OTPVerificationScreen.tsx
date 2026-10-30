import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Platform,
} from 'react-native';
import {
  ShieldCheck,
  Smartphone,
  Lock,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react-native';

interface OTPVerificationScreenProps {
  phoneNumber: string;
  role: 'customer' | 'vendor' | 'admin';
  expiresAt: string; // ISO string from backend
  onVerify: (otp: string, trustDevice: boolean) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isVerifying: boolean;
  isResending: boolean;
  errorMessage?: string | null;
  serverOtpHint?: string;
}

export const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  phoneNumber,
  role,
  expiresAt,
  onVerify,
  onResend,
  onBack,
  isVerifying,
  isResending,
  errorMessage,
  serverOtpHint,
}) => {
  // 6 separate digits
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [trustDevice, setTrustDevice] = useState<boolean>(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(60);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // References to the 6 TextInput elements
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);

  // Role Theme Colors
  const roleColor = role === 'admin' ? '#7C3AED' : (role === 'vendor' ? '#047857' : '#07843D');
  const roleLightColor = role === 'admin' ? '#F5F3FF' : (role === 'vendor' ? '#ECFDF5' : '#EBF6EE');
  const roleTitle = role === 'admin' ? 'Super Admin' : (role === 'vendor' ? 'Vendor Farm' : 'Customer');

  // ── Real-Time 60s Countdown Timer Calculated from Server Expiry ──
  const calculateRemaining = () => {
    if (!expiresAt) return 60;
    const targetMs = new Date(expiresAt).getTime();
    const nowMs = Date.now();
    const diffSec = Math.max(0, Math.ceil((targetMs - nowMs) / 1000));
    return diffSec;
  };

  useEffect(() => {
    // Initial calculation
    const initialSec = calculateRemaining();
    setRemainingSeconds(initialSec);
    setIsExpired(initialSec <= 0);

    const timer = setInterval(() => {
      const sec = calculateRemaining();
      setRemainingSeconds(sec);
      if (sec <= 0) {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }
    }, 1000);

    // AppState listener: if app comes back from background, recalculate timer accurately!
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const sec = calculateRemaining();
        setRemainingSeconds(sec);
        setIsExpired(sec <= 0);
      }
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [expiresAt]);

  // Format MM:SS
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle single digit input
  const handleDigitChange = (val: string, index: number) => {
    // Check if user pasted complete 6-digit OTP into any box
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (cleanVal.length === 6) {
      const arr = cleanVal.split('');
      setDigits(arr);
      inputRefs.current[5]?.focus();
      return;
    }

    const singleDigit = cleanVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    setDigits(newDigits);

    // If entered a digit, auto-focus next input
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Full OTP string
  const currentOtp = digits.join('');
  const isOtpComplete = currentOtp.length === 6;

  const handleSubmit = () => {
    if (isExpired) return;
    if (isOtpComplete) {
      onVerify(currentOtp, trustDevice);
    }
  };

  return (
    <View className="flex-1 bg-white px-5 pt-8 pb-6 justify-between">
      {/* Top Header & Navigation */}
      <View>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mb-6"
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>

        {/* Role Badge */}
        <View className="flex-row items-center mb-3">
          <View
            className="px-3 py-1 rounded-full flex-row items-center gap-1.5"
            style={{ backgroundColor: roleLightColor }}
          >
            <ShieldCheck size={14} color={roleColor} />
            <Text className="text-xs font-black uppercase tracking-wider" style={{ color: roleColor }}>
              {roleTitle} Authentication
            </Text>
          </View>
        </View>

        {/* Screen Title & Subtitle */}
        <Text className="text-2xl font-black text-slate-900 tracking-tight">
          Verify Your Mobile Number
        </Text>
        <Text className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
          Enter the 6-digit OTP sent to{' '}
          <Text className="font-bold text-slate-800">+91 {phoneNumber}</Text>.
        </Text>

        {/* Demo Simulator Hint if in test environment */}
        {serverOtpHint ? (
          <View className="mt-3 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color="#D97706" />
              <Text className="text-xs text-amber-900 font-bold">
                Auto-detected OTP: <Text className="font-black text-sm tracking-widest">{serverOtpHint}</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                const arr = serverOtpHint.split('');
                setDigits(arr);
                inputRefs.current[5]?.focus();
              }}
              className="bg-amber-600 px-2.5 py-1 rounded-lg"
            >
              <Text className="text-white text-xs font-black">Fill</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 6 Separate OTP Boxes */}
        <View className="flex-row justify-between items-center mt-7 gap-2">
          {digits.map((digit, idx) => {
            const isFocused = digits.findIndex(d => d === '') === idx;
            return (
              <TextInput
                key={idx}
                ref={el => {
                  inputRefs.current[idx] = el;
                }}
                value={digit}
                onChangeText={val => handleDigitChange(val, idx)}
                onKeyPress={e => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={idx === 0 ? 6 : 1}
                selectTextOnFocus
                editable={!isVerifying}
                autoFocus={idx === 0}
                className={`w-12 h-14 rounded-2xl text-center text-xl font-black border-2 ${
                  digit
                    ? 'border-emerald-600 bg-emerald-50/50 text-slate-900'
                    : isFocused
                    ? 'border-emerald-500 bg-white text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              />
            );
          })}
        </View>

        {/* Timer & Resend Controls */}
        <View className="mt-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Clock size={16} color={isExpired ? '#EF4444' : '#64748B'} />
            <Text
              className={`text-sm font-bold ${
                isExpired ? 'text-red-500 font-extrabold' : 'text-slate-600'
              }`}
            >
              {isExpired ? 'OTP Expired (00:00)' : `Expires in ${formatTimer(remainingSeconds)}`}
            </Text>
          </View>

          {/* Resend button: Enabled only when timer reaches 00:00 */}
          <TouchableOpacity
            onPress={onResend}
            disabled={!isExpired || isResending}
            className={`px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5 ${
              isExpired
                ? 'bg-emerald-50 border border-emerald-300 active:bg-emerald-100'
                : 'opacity-40'
            }`}
            activeOpacity={0.7}
          >
            {isResending ? (
              <ActivityIndicator size="small" color="#047857" />
            ) : (
              <>
                <RotateCw size={13} color={isExpired ? '#047857' : '#94A3B8'} />
                <Text
                  className={`text-xs font-black ${
                    isExpired ? 'text-emerald-800' : 'text-slate-400'
                  }`}
                >
                  Resend OTP
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Notification */}
        {errorMessage ? (
          <View className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex-row items-center gap-2">
            <AlertCircle size={16} color="#EF4444" />
            <Text className="text-xs text-red-700 font-semibold flex-1">
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Trusted Device Consent Checkbox */}
        <TouchableOpacity
          onPress={() => setTrustDevice(!trustDevice)}
          className="mt-6 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex-row items-center justify-between active:bg-slate-100"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View className="w-9 h-9 rounded-xl bg-white border border-slate-200 items-center justify-center shadow-xs">
              <Smartphone size={18} color="#047857" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-black text-slate-800">
                Trust this device for automatic login
              </Text>
              <Text className="text-[11px] text-slate-500 font-medium mt-0.5">
                Stay logged in securely without needing an OTP every time you open the app.
              </Text>
            </View>
          </View>

          <View
            className={`w-6 h-6 rounded-lg border-2 items-center justify-center ${
              trustDevice ? 'bg-emerald-700 border-emerald-700' : 'border-slate-300 bg-white'
            }`}
          >
            {trustDevice && <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={3} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* Verify & Continue Button */}
      <View className="mt-6">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isOtpComplete || isVerifying || isExpired}
          className={`w-full py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-sm ${
            isOtpComplete && !isExpired && !isVerifying
              ? 'bg-emerald-700 active:bg-emerald-800 shadow-emerald-700/20'
              : 'bg-slate-200'
          }`}
          activeOpacity={0.85}
        >
          {isVerifying ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-1">Verifying Secure Session...</Text>
            </>
          ) : (
            <>
              <Lock size={18} color={isOtpComplete && !isExpired ? '#FFFFFF' : '#94A3B8'} />
              <Text
                className={`text-base font-black ${
                  isOtpComplete && !isExpired ? 'text-white' : 'text-slate-400'
                }`}
              >
                {isExpired ? 'OTP Expired · Resend Above' : 'Verify & Open App'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
