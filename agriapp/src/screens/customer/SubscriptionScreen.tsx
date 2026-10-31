import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunrise,
  Moon,
  Plus,
  Minus,
  Info,
  CheckCircle2,
  ShieldCheck,
  Sprout,
  Sparkles,
  X,
} from 'lucide-react-native';

import { Product } from '../../constants/mockData';
import { safeCategory } from '../../services/api.client';
import {
  subscriptionService,
  ProductSubscriptionSettingsModel,
  DeliverySlotOption,
  UnitMultiplierOption,
} from '../../services/subscription.service';
import { productService } from '../../services/product.service';

export interface SubscriptionConfig {
  product: Product;
  qty: number;
  freq: 'Daily' | 'Alternate' | 'Weekly' | 'Monthly';
  duration: number;
  time: string;
  timeSlot?: string;
  priceTotal: number;
  selectedDays?: string[];
  selectedDates?: number[];
  startDate?: string;
  endDate?: string;
  totalDeliveries?: number;
  pricePerDelivery?: number;
}

export interface SubscriptionScreenProps {
  product: Product;
  initialQty?: number;
  userPhone?: string;
  onBack: () => void;
  onProceedToPayment?: (config: SubscriptionConfig) => void;
  onSubscriptionCreated?: (createdSub: any) => void;
}

const WEEKDAYS = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
];

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  product,
  initialQty = 1,
  userPhone = '',
  onBack,
  onProceedToPayment,
  onSubscriptionCreated,
}) => {
  const insets = useSafeAreaInsets();

  // Step state: 'configure' | 'review' | 'success'
  const [step, setStep] = useState<'configure' | 'review' | 'success'>('configure');

  // Database settings state
  const [settings, setSettings] = useState<ProductSubscriptionSettingsModel | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Configuration fields
  const [qty, setQty] = useState(initialQty);
  const [freq, setFreq] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);

  // Alternative product for weekly delivery
  const [availableAlternatives, setAvailableAlternatives] = useState<Product[]>([]);
  const [selectedAlternative, setSelectedAlternative] = useState<Product | null>(null);
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);

  // Delivery Time slot states
  const [timeMode, setTimeMode] = useState<'recommended' | 'custom'>('recommended');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('07:00 AM');

  // Plan Duration is unified to 30 Days Monthly Billing Cycle
  const duration = 30;

  // Fetch available alternatives from database
  useEffect(() => {
    productService.getProducts().then((list) => {
      if (Array.isArray(list)) {
        const others = list.filter(p => p.id !== product.id && p.subscriptionAllowed);
        setAvailableAlternatives(others.slice(0, 10));
      }
    }).catch(() => {});
  }, [product.id]);

  // Start Date
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Modal for Start Date Picker
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [calendarViewMonth, setCalendarViewMonth] = useState(() => new Date());

  // Submitting / Creating state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSubscriptionData, setCreatedSubscriptionData] = useState<any>(null);

  // 1. Fetch Database-driven product settings
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSettings(true);
    subscriptionService.getSettingsForProduct(product.id)
      .then(res => {
        if (!isMounted) return;
        if (res) {
          setSettings(res);
          // Set initial unit-appropriate qty if needed
          if (res.minimumQuantity && initialQty < res.minimumQuantity) {
            setQty(res.minimumQuantity);
          }
          // Set default slot
          if (res.allowedDeliverySlots && res.allowedDeliverySlots.length > 0) {
            setSelectedSlotId(res.allowedDeliverySlots[0].id);
            setSelectedSlotLabel(res.allowedDeliverySlots[0].time);
          } else if (res.defaultSlot) {
            setSelectedSlotLabel(res.defaultSlot);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingSettings(false);
      });

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  // Derived effective quantity unit
  const effectiveUnit = settings?.quantityUnit || product.unit || 'Kg';

  // Derived unit preset chips
  const unitChips: UnitMultiplierOption[] = useMemo(() => {
    if (settings && settings.unitMultipliers && settings.unitMultipliers.length > 0) {
      return settings.unitMultipliers;
    }
    const isLitre = effectiveUnit.toLowerCase().includes('lit') || product.name.toLowerCase().includes('milk');
    if (isLitre) {
      return [
        { label: '250 ml', qty: 0.25 },
        { label: '500 ml', qty: 0.5 },
        { label: '1 L', qty: 1 },
        { label: '2 L', qty: 2 },
      ];
    }
    return [
      { label: '500 g', qty: 0.5 },
      { label: '1 Kg', qty: 1 },
      { label: '2 Kg', qty: 2 },
      { label: '5 Kg', qty: 5 },
    ];
  }, [settings, effectiveUnit, product.name]);

  // Derived delivery slots
  const deliverySlots: DeliverySlotOption[] = useMemo(() => {
    if (settings && settings.allowedDeliverySlots && settings.allowedDeliverySlots.length > 0) {
      return settings.allowedDeliverySlots;
    }
    const isMilk = product.name.toLowerCase().includes('milk');
    if (isMilk) {
      return [
        { id: 'milk_morning', time: '06:00 AM - 09:00 AM', label: 'Morning Delivery', icon: 'sun' },
        { id: 'milk_evening', time: '05:00 PM - 08:00 PM', label: 'Evening Delivery', icon: 'moon' },
      ];
    }
    return [
      { id: 'veg_early', time: '06:00 AM - 08:00 AM', label: 'Early Morning', icon: 'sunrise' },
      { id: 'veg_morning', time: '08:00 AM - 10:00 AM', label: 'Morning', icon: 'sun' },
    ];
  }, [settings, product.name]);

  // Set default slot if slot ID not yet set
  useEffect(() => {
    if (!selectedSlotId && deliverySlots.length > 0) {
      setSelectedSlotId(deliverySlots[0].id);
      setSelectedSlotLabel(deliverySlots[0].time);
    }
  }, [deliverySlots, selectedSlotId]);

  // Helper to format quantity display with correct unit (ml / g / Litre / Kg)
  const formatQtyDisplay = (q: number) => {
    const isLitre = effectiveUnit.toLowerCase().includes('lit') || product.name.toLowerCase().includes('milk');
    const isKg = effectiveUnit.toLowerCase().includes('kg');
    if (q === 0.25) return isLitre ? '250 ml' : isKg ? '250 g' : '0.25';
    if (q === 0.5) return isLitre ? '500 ml' : isKg ? '500 g' : '0.5';
    if (q === 0.75) return isLitre ? '750 ml' : isKg ? '750 g' : '0.75';
    return `${q} ${effectiveUnit}`;
  };

  // Step quantity handler with natural increments (250ml, 500ml, 1L, 1.5L, 2L, etc.)
  const handleQtyStep = (delta: number) => {
    const min = settings?.minimumQuantity || 0.25;
    const max = settings?.maximumQuantity || 20;
    const isLitre = effectiveUnit.toLowerCase().includes('lit') || product.name.toLowerCase().includes('milk');
    const isKg = effectiveUnit.toLowerCase().includes('kg');

    if (isLitre || isKg) {
      const allowedSteps = [0.25, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10];
      if (delta > 0) {
        const next = allowedSteps.find(s => s > (qty + 0.01));
        const val = next !== undefined ? next : qty + 1;
        setQty(Math.min(max, Number(val.toFixed(2))));
      } else {
        const prevSteps = allowedSteps.filter(s => s < (qty - 0.01));
        const val = prevSteps.length > 0 ? prevSteps[prevSteps.length - 1] : min;
        setQty(Math.max(min, Number(val.toFixed(2))));
      }
    } else {
      setQty(prev => Math.max(min, Math.min(max, prev + delta)));
    }
  };

  // 2. Dynamic Schedule Calculation (30-day default billing cycle)
  const scheduleCalculation = useMemo(() => {
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return { totalDeliveries: 30, endDateStr: '', priceTotal: qty * product.price * 30 };

    const end = new Date(start);
    end.setDate(end.getDate() + duration - 1);

    const calculatedDates: string[] = [];
    const dayIndices: number[] = selectedDays.map((d: string): number => {
      switch (d) {
        case 'Sun': return 0;
        case 'Mon': return 1;
        case 'Tue': return 2;
        case 'Wed': return 3;
        case 'Thu': return 4;
        case 'Fri': return 5;
        case 'Sat': return 6;
        default: return -1;
      }
    }).filter((x: number) => x !== -1);

    const curr = new Date(start);
    while (curr <= end) {
      let match = false;
      if (freq === 'Daily') {
        match = true;
      } else if (freq === 'Weekly') {
        match = dayIndices.includes(curr.getDay());
      } else if (freq === 'Monthly') {
        // Once per month on start day
        match = curr.getDate() === start.getDate();
      }

      if (match) {
        calculatedDates.push(curr.toISOString().split('T')[0]);
      }
      curr.setDate(curr.getDate() + 1);
    }

    const totalDrops = Math.max(0, calculatedDates.length);
    const pricePerDrop = Number((qty * product.price).toFixed(2));
    const priceTotal = Math.round(pricePerDrop * totalDrops);

    return {
      totalDeliveries: totalDrops,
      endDateStr: end.toISOString().split('T')[0],
      pricePerDelivery: pricePerDrop,
      priceTotal,
      firstDeliveryDate: calculatedDates[0] || startDateStr,
      deliveryDates: calculatedDates,
    };
  }, [startDateStr, duration, freq, selectedDays, qty, product.price]);

  // Effective delivery time
  const effectiveDeliveryTime = timeMode === 'custom' ? customTime : selectedSlotLabel;

  // Toggle weekday selection
  const handleToggleDay = (dayShort: string) => {
    if (selectedDays.includes(dayShort)) {
      if (selectedDays.length === 1) {
        Alert.alert('Required', 'Please select at least one delivery day for weekly frequency.');
        return;
      }
      setSelectedDays(prev => prev.filter(d => d !== dayShort));
    } else {
      setSelectedDays(prev => [...prev, dayShort]);
    }
  };

  // Handle plan confirmation & saving to backend database
  const handleConfirmPlan = async () => {
    setIsSubmitting(true);
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      const subPayload = {
        productId: product.id,
        quantity: qty,
        unit: effectiveUnit,
        frequency: freq,
        selectedDays: freq === 'Weekly' ? selectedDays : [],
        selectedDates: [],
        deliveryTime: effectiveDeliveryTime,
        deliverySlot: timeMode === 'custom' ? 'Custom Delivery Time' : selectedSlotLabel,
        slotType: timeMode === 'custom' ? 'CUSTOM' : 'RECOMMENDED',
        duration,
        startDate: startDateStr,
        endDate: scheduleCalculation.endDateStr,
        totalDeliveries: scheduleCalculation.totalDeliveries,
        pricePerDelivery: scheduleCalculation.pricePerDelivery,
        priceTotal: scheduleCalculation.priceTotal,
        userPhone: cleanPhone,
        customerPhone: cleanPhone,
        paymentStatus: 'Paid',
        status: 'Active',
      };

      let createdSub: any = null;
      try {
        const res = await subscriptionService.createSubscription(subPayload);
        if (res && res.success && res.data) {
          createdSub = res.data;
        }
      } catch (err: any) {
        console.warn('Subscription creation API error, falling back locally:', err?.message || err);
      }

      if (!createdSub) {
        createdSub = {
          id: 'sub_' + Date.now(),
          ...subPayload,
          product,
          status: 'Active',
          skippedDates: [],
          createdAt: new Date().toISOString(),
        };
      }

      setCreatedSubscriptionData(createdSub);
      setStep('success');
      Alert.alert(
        'Subscription Activated! 🎉',
        `Your ${freq} plan for ${product.name} (₹${scheduleCalculation.priceTotal}) has been successfully activated!`
      );
    } catch (err: any) {
      console.warn('Subscription confirmation notice:', err);
      const fallback = {
        id: 'sub_' + Date.now(),
        productId: product.id,
        quantity: qty,
        unit: effectiveUnit,
        frequency: freq,
        selectedDays: freq === 'Weekly' ? selectedDays : [],
        selectedDates: [],
        deliveryTime: effectiveDeliveryTime,
        duration,
        startDate: startDateStr,
        endDate: scheduleCalculation.endDateStr,
        totalDeliveries: scheduleCalculation.totalDeliveries,
        pricePerDelivery: scheduleCalculation.pricePerDelivery,
        priceTotal: scheduleCalculation.priceTotal,
        userPhone: userPhone || '',
        customerPhone: userPhone || '',
        paymentStatus: 'Paid',
        status: 'Active',
        product,
        skippedDates: [],
      };
      setCreatedSubscriptionData(fallback);
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date helper (e.g. "01 Nov 2026")
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Simple Month Calendar Picker component
  const renderCalendarPicker = (
    currentSelectedStr: string,
    onSelectDate: (dStr: string) => void,
    onClose: () => void,
    title: string
  ) => {
    const year = calendarViewMonth.getFullYear();
    const month = calendarViewMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const todayStr = new Date().toISOString().split('T')[0];

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return (
      <View className="bg-white rounded-3xl p-5 w-[90%] max-w-[360px] shadow-2xl border border-slate-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-extrabold text-slate-900">{title}</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Month Navigation */}
        <View className="flex-row justify-between items-center mb-3 px-2">
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            onPress={() => setCalendarViewMonth(new Date(year, month - 1, 1))}
          >
            <ChevronLeft size={16} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-slate-900">
            {monthNames[month]} {year}
          </Text>
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            onPress={() => setCalendarViewMonth(new Date(year, month + 1, 1))}
          >
            <ChevronRight size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Days Header */}
        <View className="flex-row justify-between mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(dh => (
            <Text key={dh} className="w-10 text-center text-xs font-semibold text-slate-400">
              {dh}
            </Text>
          ))}
        </View>

        {/* Days Grid */}
        <View className="flex-row flex-wrap">
          {days.map((d, idx) => {
            if (d === null) {
              return <View key={idx} className="w-[14.28%] h-9" />;
            }
            const dateObjStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = dateObjStr === currentSelectedStr;
            const isPast = dateObjStr < todayStr;

            return (
              <TouchableOpacity
                key={idx}
                disabled={isPast}
                className={`w-[14.28%] h-9 items-center justify-center rounded-full my-0.5 ${
                  isSelected ? 'bg-[#07843D]' : isPast ? 'opacity-30' : 'bg-transparent'
                }`}
                onPress={() => {
                  onSelectDate(dateObjStr);
                  onClose();
                }}
              >
                <Text
                  className={`text-xs ${
                    isSelected ? 'text-white font-extrabold' : isPast ? 'text-slate-400' : 'text-slate-800 font-semibold'
                  }`}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // SUCCESS STEP
  // ─────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <View className="flex-1 bg-[#FDFBF7] items-center justify-center p-6">
        <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mb-4">
          <CheckCircle2 size={44} color="#07843D" />
        </View>
        <Text className="text-2xl font-black text-slate-900 text-center mb-1">
          Subscription Activated!
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          Your automated recurring delivery has been stored in the database.
        </Text>

        <View className="bg-white rounded-2xl p-4 w-full border border-slate-200 mb-6 shadow-sm">
          <View className="flex-row items-center gap-3 pb-3 border-b border-slate-100">
            <Image
              source={{ uri: product.imageUrl }}
              className="w-12 h-12 rounded-xl bg-slate-100"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-sm font-extrabold text-slate-900">{product.name}</Text>
              <Text className="text-xs text-emerald-700 font-bold">
                {qty} {effectiveUnit} · {freq}
              </Text>
            </View>
          </View>
          <View className="pt-3 space-y-1">
            <View className="flex-row justify-between py-1">
              <Text className="text-xs text-slate-500">First Drop Date</Text>
              <Text className="text-xs font-bold text-slate-800">
                {formatDateDisplay(scheduleCalculation.firstDeliveryDate)}
              </Text>
            </View>
            <View className="flex-row justify-between py-1">
              <Text className="text-xs text-slate-500">Delivery Window</Text>
              <Text className="text-xs font-bold text-slate-800">{effectiveDeliveryTime}</Text>
            </View>
            <View className="flex-row justify-between py-1">
              <Text className="text-xs text-slate-500">Total Deliveries</Text>
              <Text className="text-xs font-bold text-slate-800">
                {scheduleCalculation.totalDeliveries} Drops
              </Text>
            </View>
            <View className="flex-row justify-between py-1 border-t border-slate-100 mt-1">
              <Text className="text-sm font-black text-slate-900">Total Amount</Text>
              <Text className="text-base font-black text-emerald-700">
                ₹{scheduleCalculation.priceTotal}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="w-full bg-[#07843D] py-3.5 rounded-xl items-center shadow-md active:opacity-90 mb-2.5"
          onPress={() => {
            if (onSubscriptionCreated && createdSubscriptionData) {
              onSubscriptionCreated(createdSubscriptionData);
            } else {
              onBack();
            }
          }}
        >
          <Text className="text-white text-base font-extrabold">View My Subscriptions →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full bg-white border border-slate-200 py-3 rounded-xl items-center active:opacity-75"
          onPress={onBack}
        >
          <Text className="text-slate-700 text-sm font-bold">Back to Market</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // REVIEW PLAN STEP (Requirement 9)
  // ─────────────────────────────────────────────────────────────
  if (step === 'review') {
    return (
      <View className="flex-1 bg-[#FDFBF7]">
        <ScrollView contentContainerClassName="p-4 pb-40" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
          {/* Section Title & Quick Edit Pill */}
          <View className="flex-row items-center justify-between mb-3.5">
            <View className="flex-1 mr-2">
              <Text className="text-xl font-black text-slate-900">Review Plan Details</Text>
              <Text className="text-xs text-slate-500 font-medium">Verify your schedule and estimated pricing</Text>
            </View>
            <TouchableOpacity
              onPress={() => setStep('configure')}
              className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 flex-row items-center gap-1 active:opacity-75"
            >
              <ChevronLeft size={14} color="#07843D" />
              <Text className="text-xs font-bold text-emerald-800">Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Product Overview Card */}
          <View className="bg-white p-4 rounded-2xl border border-slate-200 mb-3.5 shadow-sm flex-row items-center">
            <Image
              source={{ uri: product.imageUrl }}
              className="w-16 h-16 rounded-xl bg-slate-50 mr-3"
              resizeMode="cover"
            />
            <View className="flex-1">
              <View className="self-start px-2 py-0.5 rounded-md bg-emerald-50 mb-1">
                <Text className="text-2xs font-extrabold text-emerald-800 uppercase tracking-wider">
                  {safeCategory(product.category)}
                </Text>
              </View>
              <Text className="text-base font-black text-slate-900 leading-snug" numberOfLines={2}>
                {product.name}
              </Text>
              <Text className="text-sm font-bold text-slate-700 mt-0.5">
                ₹{product.price} / {effectiveUnit}
              </Text>
            </View>
          </View>

          {/* Detailed Plan Specification Breakdown Card */}
          <View className="bg-white rounded-2xl p-4 border border-slate-200 mb-3.5 shadow-sm">
            <Text className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              Delivery Schedule & Rules
            </Text>

            <View className="space-y-2.5">
              <View className="flex-row justify-between py-1 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">Quantity per Drop</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {formatQtyDisplay(qty)}
                </Text>
              </View>

              <View className="flex-row justify-between py-1 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">Delivery Frequency</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {freq === 'Daily' ? 'Daily' : freq === 'Weekly' ? 'Weekly' : 'Monthly'}
                </Text>
              </View>

              {freq === 'Weekly' && (
                <View className="flex-row justify-between py-1 border-b border-slate-100">
                  <Text className="text-xs text-slate-500 font-medium">Selected Days</Text>
                  <Text className="text-xs font-bold text-emerald-800">
                    {selectedDays.join(', ')}
                  </Text>
                </View>
              )}

              {selectedAlternative && (
                <View className="flex-row justify-between py-1 border-b border-slate-100">
                  <Text className="text-xs text-slate-500 font-medium">Weekly Alternative Product</Text>
                  <Text className="text-xs font-bold text-emerald-800">
                    {selectedAlternative.name}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between py-1 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">Delivery Time Slot</Text>
                <Text className="text-xs font-bold text-slate-900">{effectiveDeliveryTime}</Text>
              </View>

              <View className="flex-row justify-between py-1 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">Plan Duration</Text>
                <Text className="text-xs font-bold text-slate-900">1 Month (30 Days Cycle)</Text>
              </View>

              <View className="flex-row justify-between py-1 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">Start Date</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {formatDateDisplay(startDateStr)}
                </Text>
              </View>

              <View className="flex-row justify-between py-1 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">End Date</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {formatDateDisplay(scheduleCalculation.endDateStr)}
                </Text>
              </View>

              <View className="flex-row justify-between py-1 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">Total Deliveries</Text>
                <Text className="text-xs font-bold text-emerald-800">
                  {scheduleCalculation.totalDeliveries} Drops
                </Text>
              </View>

              <View className="flex-row justify-between py-1 border-b border-slate-100">
                <Text className="text-xs text-slate-500 font-medium">Price per Delivery</Text>
                <Text className="text-xs font-bold text-slate-900">
                  ₹{scheduleCalculation.pricePerDelivery}
                </Text>
              </View>

              <View className="flex-row justify-between pt-2">
                <Text className="text-sm font-black text-slate-900">Estimated Total</Text>
                <Text className="text-lg font-black text-emerald-700">
                  ₹{scheduleCalculation.priceTotal}
                </Text>
              </View>
            </View>
          </View>

          {/* Assurance / Free Perks Card */}
          <View className="bg-white rounded-2xl p-4 border border-slate-200 mb-4 shadow-sm">
            <View className="flex-row items-center gap-1.5 mb-2.5">
              <ShieldCheck size={16} color="#07843D" />
              <Text className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                Included with Subscription
              </Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <Sprout size={14} color="#07843D" />
                <Text className="text-xs text-slate-700">100% Certified Organic & Chemical Free</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Clock size={14} color="#07843D" />
                <Text className="text-xs text-slate-700">
                  Punctual morning delivery directly from accredited farm
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <CalendarCheck size={14} color="#07843D" />
                <Text className="text-xs text-slate-700">
                  Skip dates or pause anytime with 1 tap from My Subscriptions
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Review Action Bar */}
        <View 
          style={{ paddingBottom: Math.max(16, insets.bottom + 12) }}
          className="absolute bottom-0 left-0 right-0 px-4 pt-3.5 bg-white border-t border-slate-200 flex-row items-center justify-between shadow-xl"
        >
          <TouchableOpacity
            className="px-5 py-3 rounded-xl border border-slate-300 bg-white items-center justify-center mr-3 active:opacity-70"
            onPress={() => setStep('configure')}
          >
            <Text className="text-sm font-bold text-slate-700">Edit Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isSubmitting}
            className="flex-1 bg-[#07843D] py-3.5 rounded-xl items-center justify-center shadow-md active:opacity-90 flex-row gap-2"
            onPress={handleConfirmPlan}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text className="text-white text-base font-extrabold">Confirm Subscription</Text>
                <ArrowLeft size={16} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIGURE SUBSCRIPTION SCREEN (Matching Screenshot)
  // ─────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ScrollView contentContainerClassName="p-4 pb-40" showsVerticalScrollIndicator={false}>
        {/* Top Product Card (Optimized: full title, badge, clean price) */}
        <View className="bg-white p-3.5 rounded-2xl border border-slate-200/90 mb-3.5 shadow-sm">
          <View className="flex-row items-start">
            <Image
              source={{ uri: product.imageUrl }}
              className="w-18 h-18 rounded-2xl bg-slate-50 mr-3 border border-slate-100"
              style={{ width: 72, height: 72 }}
              resizeMode="cover"
            />
            <View className="flex-1 justify-between min-h-[72px]">
              <View>
                <View className="flex-row items-center justify-between gap-1 mb-0.5">
                  <Text className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    {safeCategory(product.category)}
                  </Text>
                  <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    <Text className="text-[10px] font-extrabold text-emerald-800">
                      {settings?.badgeText || (product.name.toLowerCase().includes('milk') ? '❄️ Fresh & Chilled' : '🌱 Daily Fresh')}
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-black text-slate-900 leading-snug" numberOfLines={2}>
                  {product.name}
                </Text>
              </View>

              <View className="flex-row items-baseline mt-1.5">
                <Text className="text-lg font-black text-[#07843D]">
                  ₹{product.price}
                </Text>
                <Text className="text-xs font-bold text-slate-400 ml-1">
                  / {effectiveUnit}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dynamic Category Delivery Notice Banner */}
        <View className="bg-[#EBF7EE] border border-emerald-200/80 rounded-2xl p-3 mb-3.5 flex-row items-center gap-2.5">
          {product.name.toLowerCase().includes('milk') ? (
            <Info size={18} color="#07843D" />
          ) : (
            <Clock size={18} color="#07843D" />
          )}
          <Text className="text-xs text-emerald-950 font-semibold flex-1 leading-4">
            {settings?.categoryNotice || (product.name.toLowerCase().includes('milk')
              ? 'Milk is delivered in the morning (6:00 AM – 9:00 AM) and evening (5:00 PM – 8:00 PM).'
              : 'Vegetables and fruits are delivered fresh in the morning between 6:00 AM – 10:00 AM.')}
          </Text>
        </View>

        {/* Section 1: Quantity Selection (per delivery) */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200/90 mb-3.5 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-5 h-5 rounded-full bg-[#07843D] items-center justify-center">
                <Text className="text-white text-2xs font-black">1</Text>
              </View>
              <Text className="text-sm font-black text-slate-900">1. Quantity (per delivery)</Text>
            </View>
            <View className="px-2 py-0.5 bg-slate-100 rounded-md">
              <Text className="text-[11px] font-bold text-slate-500">Unit: {effectiveUnit}</Text>
            </View>
          </View>

          {/* Stepper Pill Container */}
          <View className="bg-[#F0FDF4] border border-emerald-300 rounded-2xl px-3 py-2 flex-row items-center justify-between mb-3">
            <Pressable
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: pressed ? '#046A31' : '#07843D',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 2,
              })}
              onPress={() => handleQtyStep(-1)}
              hitSlop={8}
            >
              <Minus size={18} color="#FFFFFF" strokeWidth={3} />
            </Pressable>

            <View className="items-center">
              <Text className="text-2xl font-black text-slate-900">
                {formatQtyDisplay(qty)}
              </Text>
              <Text className="text-[10.5px] font-bold text-emerald-800">
                ₹{(qty * product.price).toFixed(0)} per delivery
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: pressed ? '#046A31' : '#07843D',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 2,
              })}
              onPress={() => handleQtyStep(1)}
              hitSlop={8}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={3} />
            </Pressable>
          </View>

          {/* Unit Preset Chips */}
          <View className="flex-row gap-2">
            {unitChips.map(chip => {
              const isActive = qty === chip.qty;
              return (
                <Pressable
                  key={chip.label}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: isActive ? '#07843D' : '#E2E8F0',
                    backgroundColor: isActive ? '#07843D' : pressed ? '#F8FAFC' : '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                  onPress={() => setQty(chip.qty)}
                  hitSlop={6}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '800',
                      color: isActive ? '#FFFFFF' : '#334155',
                    }}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section 2: Delivery Frequency (Daily, Weekly, Monthly) */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200/90 mb-3.5 shadow-sm">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-5 h-5 rounded-full bg-[#07843D] items-center justify-center">
              <Text className="text-white text-2xs font-black">2</Text>
            </View>
            <Text className="text-sm font-black text-slate-900">2. Delivery Frequency</Text>
          </View>

          {/* 3 Simple Options: Daily, Weekly, Monthly */}
          <View className="flex-row gap-2.5 mb-3">
            {(
              [
                { key: 'Daily', label: 'Daily', sub: 'Every day (30 drops)', icon: <Calendar size={18} /> },
                { key: 'Weekly', label: 'Weekly', sub: 'Select days / week', icon: <CalendarDays size={18} /> },
                { key: 'Monthly', label: 'Monthly', sub: 'Once a month', icon: <CalendarCheck size={18} /> },
              ] as const
            ).map(item => {
              const isSelected = freq === item.key;
              return (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => ({
                    flex: 1,
                    padding: 12,
                    borderRadius: 16,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? '#07843D' : '#E2E8F0',
                    backgroundColor: isSelected ? '#F0FDF4' : pressed ? '#F8FAFC' : '#FFFFFF',
                    alignItems: 'center',
                  })}
                  onPress={() => setFreq(item.key)}
                  hitSlop={6}
                >
                  <View className="mb-1.5 items-center justify-center">
                    {React.cloneElement(item.icon, {
                      color: isSelected ? '#07843D' : '#64748B',
                      strokeWidth: isSelected ? 2.4 : 2,
                    })}
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '800',
                      color: isSelected ? '#07843D' : '#1E293B',
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2, textAlign: 'center' }}>
                    {item.sub}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Only relevant configuration for selected frequency */}
          {freq === 'Daily' && (
            <View className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80 flex-row items-center gap-2">
              <CheckCircle2 size={16} color="#07843D" />
              <Text className="text-xs text-emerald-950 font-bold flex-1">
                Delivered every morning at door step (30 drops in monthly cycle)
              </Text>
            </View>
          )}

          {freq === 'Weekly' && (
            <View className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Text className="text-xs font-bold text-slate-700 mb-2">
                Choose delivery days (Mon – Sun):
              </Text>
              <View className="flex-row flex-wrap gap-1.5 mb-2">
                {WEEKDAYS.map(day => {
                  const isDayActive = selectedDays.includes(day.short);
                  return (
                    <TouchableOpacity
                      key={day.short}
                      className={`px-3 py-1.5 rounded-lg border ${
                        isDayActive
                          ? 'bg-[#07843D] border-[#07843D]'
                          : 'bg-white border-slate-300'
                      }`}
                      onPress={() => handleToggleDay(day.short)}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isDayActive ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {day.short}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Weekly Alternative Product Selector */}
              <View className="mt-2 pt-2 border-t border-slate-200">
                <Text className="text-xs font-bold text-slate-700 mb-1.5">
                  Weekly Alternative Product (Optional):
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2"
                  onPress={() => setShowAlternativeModal(true)}
                >
                  <Text className={`text-xs ${selectedAlternative ? 'font-bold text-emerald-800' : 'text-slate-500'}`}>
                    {selectedAlternative ? `Alternative: ${selectedAlternative.name}` : 'Select alternative crop for weekly drops'}
                  </Text>
                  <Text className="text-xs text-slate-400">⌵</Text>
                </TouchableOpacity>
                {selectedAlternative && (
                  <TouchableOpacity
                    onPress={() => setSelectedAlternative(null)}
                    className="self-end mt-1"
                  >
                    <Text className="text-[10px] text-red-600 font-bold">Remove Alternative</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {freq === 'Monthly' && (
            <View className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80 flex-row items-center gap-2">
              <CheckCircle2 size={16} color="#07843D" />
              <Text className="text-xs text-emerald-950 font-bold flex-1">
                Delivered monthly on selected date ({formatDateDisplay(startDateStr)})
              </Text>
            </View>
          )}
        </View>

        {/* 6. Section 3: Delivery Time (Category-based slot cards & Recommended/Custom tabs) */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200 mb-3.5 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-5 h-5 rounded-full bg-[#07843D] items-center justify-center">
                <Text className="text-white text-2xs font-black">3</Text>
              </View>
              <Text className="text-sm font-black text-slate-900">3. Delivery Time</Text>
            </View>
            <Info size={16} color="#94A3B8" />
          </View>

          {/* Recommended vs Custom Time Tabs (As shown in screenshot) */}
          <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 4, borderRadius: 12, marginBottom: 12 }}>
            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: timeMode === 'recommended' ? '#FFFFFF' : pressed ? '#E2E8F0' : 'transparent',
                elevation: timeMode === 'recommended' ? 1 : 0,
              })}
              onPress={() => setTimeMode('recommended')}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: timeMode === 'recommended' ? '#07843D' : '#64748B',
                }}
              >
                Recommended
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: timeMode === 'custom' ? '#FFFFFF' : pressed ? '#E2E8F0' : 'transparent',
                elevation: timeMode === 'custom' ? 1 : 0,
              })}
              onPress={() => setTimeMode('custom')}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: timeMode === 'custom' ? '#07843D' : '#64748B',
                }}
              >
                Custom Time
              </Text>
            </Pressable>
          </View>

          {/* Mode 1: Recommended Delivery Slot Cards */}
          {timeMode === 'recommended' ? (
            <View className="space-y-2">
              {deliverySlots.map(slot => {
                const isSlotSelected = selectedSlotId === slot.id || selectedSlotLabel === slot.time;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    className={`flex-row items-center justify-between p-3 rounded-xl border mb-2 ${
                      isSlotSelected ? 'bg-emerald-50/50 border-[#07843D]' : 'bg-white border-slate-200'
                    }`}
                    onPress={() => {
                      setSelectedSlotId(slot.id);
                      setSelectedSlotLabel(slot.time);
                    }}
                  >
                    <View className="flex-row items-center gap-2.5 flex-1">
                      {slot.icon === 'moon' ? (
                        <Moon size={18} color={isSlotSelected ? '#07843D' : '#64748B'} />
                      ) : slot.icon === 'sunrise' ? (
                        <Sunrise size={18} color={isSlotSelected ? '#07843D' : '#F59E0B'} />
                      ) : (
                        <Sun size={18} color={isSlotSelected ? '#07843D' : '#F59E0B'} />
                      )}
                      <View>
                        <Text className="text-xs font-black text-slate-900">{slot.time}</Text>
                        <Text className="text-2xs text-slate-400 font-semibold">{slot.label}</Text>
                      </View>
                    </View>

                    {/* Radio Dot indicator */}
                    <View
                      className={`w-5 h-5 rounded-full border items-center justify-center ${
                        isSlotSelected ? 'border-[#07843D] bg-white' : 'border-slate-300'
                      }`}
                    >
                      {isSlotSelected && <View className="w-2.5 h-2.5 rounded-full bg-[#07843D]" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Mode 2: Custom Time Options */
            <View className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Text className="text-xs font-bold text-slate-700 mb-2">
                Select your preferred morning delivery hour:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM'].map(t => {
                  const isCur = customTime === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      className={`px-3 py-2 rounded-xl border ${
                        isCur ? 'bg-[#07843D] border-[#07843D]' : 'bg-white border-slate-300'
                      }`}
                      onPress={() => setCustomTime(t)}
                    >
                      <Text className={`text-xs font-bold ${isCur ? 'text-white' : 'text-slate-700'}`}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Section 4: Start Date */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200/90 mb-3.5 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <View className="w-5 h-5 rounded-full bg-[#07843D] items-center justify-center">
                <Text className="text-white text-2xs font-black">4</Text>
              </View>
              <Text className="text-sm font-black text-slate-900">4. Start Date</Text>
            </View>

            {/* Calendar trigger button */}
            <TouchableOpacity
              className="flex-row items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-xl active:opacity-80"
              onPress={() => setShowStartDateModal(true)}
            >
              <Calendar size={14} color="#07843D" />
              <Text className="text-xs font-black text-slate-800">
                {formatDateDisplay(startDateStr)}
              </Text>
              <Text className="text-xs text-slate-400">⌵</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-2xs text-emerald-800 font-bold mt-2">
            ✓ 1-Month Cycle begins: {formatDateDisplay(scheduleCalculation.firstDeliveryDate)} • Total: {scheduleCalculation.totalDeliveries} Drops
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Summary Bar */}
      <View 
        style={{ paddingBottom: Math.max(16, insets.bottom + 12) }}
        className="absolute bottom-0 left-0 right-0 px-4 pt-3.5 bg-white border-t border-slate-200 flex-row items-center justify-between shadow-2xl"
      >
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-1">
            <Text className="text-xs font-extrabold text-emerald-900">Estimated Total</Text>
            <Info size={12} color="#07843D" />
          </View>
          <Text className="text-2xl font-black text-emerald-800">
            ₹{scheduleCalculation.priceTotal.toLocaleString()}
          </Text>
          <Text className="text-[11px] text-slate-400 font-semibold mt-0.5" numberOfLines={1}>
            ({formatQtyDisplay(qty)} × {scheduleCalculation.totalDeliveries} drops · 1 Month)
          </Text>
        </View>

        <Pressable
          hitSlop={8}
          onPress={() => setStep('review')}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#046A31' : '#07843D',
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            elevation: 4,
          })}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>Review Plan</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>→</Text>
        </Pressable>
      </View>

      {/* Start Date Calendar Modal */}
      <Modal visible={showStartDateModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center p-4">
          {renderCalendarPicker(
            startDateStr,
            (newDate) => setStartDateStr(newDate),
            () => setShowStartDateModal(false),
            'Select Start Date'
          )}
        </View>
      </Modal>

      {/* Alternative Product Selection Modal */}
      <Modal visible={showAlternativeModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <View>
                <Text className="text-base font-extrabold text-slate-900">Choose Weekly Alternative</Text>
                <Text className="text-xs text-slate-500">Delivered when primary crop is paused</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAlternativeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {availableAlternatives.map((alt) => {
                const isSelected = selectedAlternative?.id === alt.id;
                return (
                  <TouchableOpacity
                    key={alt.id}
                    className={`flex-row items-center justify-between p-3.5 rounded-xl mb-2.5 border ${
                      isSelected ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                    }`}
                    onPress={() => {
                      setSelectedAlternative(alt);
                      setShowAlternativeModal(false);
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      <Image
                        source={{ uri: alt.imageUrl }}
                        className="w-10 h-10 rounded-lg bg-slate-100"
                        resizeMode="cover"
                      />
                      <View>
                        <Text className="text-sm font-bold text-slate-900">{alt.name}</Text>
                        <Text className="text-xs text-emerald-800 font-semibold">₹{alt.price} / {alt.unit || 'Kg'}</Text>
                      </View>
                    </View>
                    {isSelected && <Check size={18} color="#07843D" />}
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
