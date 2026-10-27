import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Sparkles, ShieldCheck, Sprout, ArrowLeft } from 'lucide-react-native';
import { Product } from '../../constants/mockData';
import { SubscriptionButton } from '../../components/SubscriptionButton';
import { theme } from '../../theme';

export interface SubscriptionConfig {
  product: Product;
  qty: number;
  freq: 'Daily' | 'Weekly' | 'Monthly';
  duration: number;
  time: string;
  priceTotal: number;
}

export interface SubscriptionScreenProps {
  product: Product;
  initialQty?: number;
  onBack: () => void;
  onProceedToPayment: (config: SubscriptionConfig) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  product,
  initialQty = 1,
  onBack,
  onProceedToPayment,
}) => {
  const [step, setStep] = useState<'create' | 'summary'>('create');
  const [subQty, setSubQty] = useState(initialQty);
  const [subFreq, setSubFreq] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [subDuration, setSubDuration] = useState(30);
  const [subTime, setSubTime] = useState('06:30 AM');

  const total =
    subQty *
    product.price *
    (subFreq === 'Daily' ? subDuration : subFreq === 'Weekly' ? Math.ceil(subDuration / 7) : 1);

  if (step === 'summary') {
    return (
      <View className="flex-1 bg-[#FDFBF7]">
        <View className="px-4 pt-3 flex-row items-center gap-2">
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center"
            onPress={() => setStep('create')}
          >
            <ArrowLeft size={18} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-lg font-extrabold text-slate-900">Plan Summary</Text>
        </View>

        <ScrollView contentContainerClassName="p-4" showsVerticalScrollIndicator={false}>
          <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-3.5 shadow-sm">
            <Text className="text-base font-extrabold text-slate-900 mb-2">Order Details</Text>
            {[
              { lbl: 'Product', val: product.name },
              { lbl: 'Qty / Drop', val: `${subQty} ${product.unit}` },
              { lbl: 'Frequency', val: subFreq },
              { lbl: 'Delivery Slot', val: subTime },
              { lbl: 'Duration', val: `${subDuration} Days` },
              { lbl: 'Total Amount', val: `₹${total}` },
            ].map(row => (
              <View key={row.lbl} className="flex-row justify-between py-2.5 border-b border-slate-100">
                <Text className="text-sm text-slate-500">{row.lbl}</Text>
                <Text className="text-sm font-bold text-slate-900">{row.val}</Text>
              </View>
            ))}
          </View>

          <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-3.5 shadow-sm">
            <View className="flex-row items-center gap-1.5 mb-2">
              <ShieldCheck size={16} color={theme.colors.success} />
              <Text className="text-sm font-extrabold text-emerald-700">Free Benefits Included</Text>
            </View>
            {['Free morning doorstep delivery', 'WhatsApp delivery alerts', 'Skip or pause anytime'].map(b => (
              <View key={b} className="flex-row items-start gap-2 py-1.5">
                <View className="mr-1.5 mt-0.5">
                  <Sprout size={14} color={theme.colors.light} />
                </View>
                <Text className="text-sm text-slate-700">{b}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View className="p-4 bg-white border-t border-slate-200 flex-row items-center justify-between shadow-lg">
          <Text className="text-sm text-slate-600">Advance payment required</Text>
          <SubscriptionButton
            title="Proceed to Payment →"
            size="large"
            variant="primary"
            onPress={() =>
              onProceedToPayment({
                product,
                qty: subQty,
                freq: subFreq,
                duration: subDuration,
                time: subTime,
                priceTotal: total,
              })
            }
            className="min-w-[200px]"
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      {/* Top Bar with Back Button */}
      <View className="px-4 pt-3 flex-row items-center gap-2">
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center"
          onPress={onBack}
        >
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-slate-900">Configure Subscription</Text>
      </View>

      {/* Compact Product Header Card */}
      <View className="bg-white p-3.5 mx-4 mt-3 mb-1 rounded-2xl flex-row items-center border border-slate-200 shadow-sm">
        <Image
          source={{
            uri:
              product.imageUrl ||
              'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300',
          }}
          className="w-14 h-14 rounded-xl bg-slate-50"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center gap-1">
            <Sparkles size={12} color="#15803D" />
            <Text className="text-xs font-black text-emerald-700 tracking-wider">DAILY SUBSCRIPTION</Text>
          </View>
          <Text className="text-base font-extrabold text-slate-900 mt-0.5" numberOfLines={1}>
            {product.name}
          </Text>
          <Text className="text-sm font-bold text-emerald-700 mt-0.5">
            ₹{product.price} / {product.unit}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-4" showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-slate-500 mb-4">
          Set up automated deliveries for {product.name}
        </Text>

        {[
          {
            title: 'Daily Quantity',
            body: (
              <View className="flex-row items-center bg-emerald-50 border border-emerald-300 rounded-xl px-2 py-1 gap-4 self-start">
                <TouchableOpacity
                  className="w-8 h-8 rounded-lg bg-emerald-700 items-center justify-center"
                  onPress={() => setSubQty(Math.max(1, subQty - 1))}
                >
                  <Text className="text-white text-base font-black">−</Text>
                </TouchableOpacity>
                <Text className="text-sm font-black text-slate-900">
                  {subQty} {product.unit}
                </Text>
                <TouchableOpacity
                  className="w-8 h-8 rounded-lg bg-emerald-700 items-center justify-center"
                  onPress={() => setSubQty(subQty + 1)}
                >
                  <Text className="text-white text-base font-black">+</Text>
                </TouchableOpacity>
              </View>
            ),
          },
          {
            title: 'Delivery Frequency',
            body: (
              <View className="flex-row gap-2">
                {(['Daily', 'Weekly', 'Monthly'] as const).map(f => (
                  <TouchableOpacity
                    key={f}
                    className={`px-4 py-2 rounded-xl border ${
                      subFreq === f ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-slate-200'
                    }`}
                    onPress={() => setSubFreq(f)}
                  >
                    <Text
                      className={`text-sm ${
                        subFreq === f ? 'text-white font-bold' : 'font-semibold text-slate-600'
                      }`}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ),
          },
          {
            title: 'Morning Delivery Slot',
            body: (
              <View className="flex-row gap-2">
                {['06:00 AM', '07:00 AM', '08:00 AM'].map(t => (
                  <TouchableOpacity
                    key={t}
                    className={`px-4 py-2 rounded-xl border ${
                      subTime === t ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-slate-200'
                    }`}
                    onPress={() => setSubTime(t)}
                  >
                    <Text
                      className={`text-sm ${
                        subTime === t ? 'text-white font-bold' : 'font-semibold text-slate-600'
                      }`}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ),
          },
          {
            title: 'Plan Duration',
            body: (
              <View className="flex-row gap-2">
                {[15, 30, 90].map(d => (
                  <TouchableOpacity
                    key={d}
                    className={`px-4 py-2 rounded-xl border ${
                      subDuration === d ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-slate-200'
                    }`}
                    onPress={() => setSubDuration(d)}
                  >
                    <Text
                      className={`text-sm ${
                        subDuration === d ? 'text-white font-bold' : 'font-semibold text-slate-600'
                      }`}
                    >
                      {d} Days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ),
          },
        ].map((block, i) => (
          <View key={i} className="bg-white border border-slate-200 rounded-2xl p-4 mb-3.5 shadow-sm">
            <Text className="text-sm font-extrabold text-slate-900">{block.title}</Text>
            <View className="mt-2.5">{block.body}</View>
          </View>
        ))}
      </ScrollView>

      <View className="p-4 bg-white border-t border-slate-200 flex-row items-center justify-between shadow-lg">
        <View>
          <Text className="text-xs font-black text-emerald-800 uppercase tracking-wider">
            ESTIMATED TOTAL
          </Text>
          <Text className="text-xl font-black text-slate-900">₹{total}</Text>
        </View>
        <SubscriptionButton
          title="Review Plan →"
          size="large"
          variant="primary"
          onPress={() => setStep('summary')}
          className="min-w-[180px]"
        />
      </View>
    </View>
  );
};
