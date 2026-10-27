import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Clock, Calendar, Package, Sprout } from 'lucide-react-native';
import { SubscriptionButton } from '../../components/SubscriptionButton';
import { theme } from '../../theme';

export interface MySubscriptionsScreenProps {
  subscriptions: any[];
  onUpdateSubscriptions: (subs: any[]) => void;
  onExplorePlans: () => void;
}

export const MySubscriptionsScreen: React.FC<MySubscriptionsScreenProps> = ({
  subscriptions,
  onUpdateSubscriptions,
  onExplorePlans,
}) => {
  const [subTab, setSubTab] = useState<'Active' | 'History'>('Active');

  const handlePause = (id: string) => {
    onUpdateSubscriptions(
      subscriptions.map((s: any) =>
        s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s
      )
    );
  };

  const handleSkip = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    onUpdateSubscriptions(
      subscriptions.map((s: any) => {
        if (s.id !== id) return s;
        const skipped = s.skippedDates || [];
        return {
          ...s,
          skippedDates: skipped.includes(today)
            ? skipped.filter((d: string) => d !== today)
            : [...skipped, today],
        };
      })
    );
  };

  const handleCancel = (id: string) => {
    Alert.alert('Cancel Subscription', 'Are you sure you want to cancel this plan?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => onUpdateSubscriptions(subscriptions.filter((s: any) => s.id !== id)),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#F6F8F6]">
      {/* Tab Switcher */}
      <View className="flex-row bg-slate-100 p-1.5 rounded-xl mx-4 mt-3 mb-2">
        {(['Active', 'History'] as const).map(t => (
          <TouchableOpacity
            key={t}
            className={`flex-1 py-2 items-center rounded-lg ${
              subTab === t ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => setSubTab(t)}
          >
            <Text
              className={`text-xs font-bold ${
                subTab === t ? 'text-emerald-800' : 'text-slate-500'
              }`}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerClassName="p-4" showsVerticalScrollIndicator={false}>
        {subTab === 'Active' &&
          subscriptions.map((sub: any) => {
            const today = new Date().toISOString().split('T')[0];
            const skippedToday = (sub.skippedDates || []).includes(today);

            return (
              <View
                key={sub.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-slate-200 shadow-sm"
              >
                <View className="flex-row justify-between items-center">
                  <Image
                    source={{ uri: sub.product.imageUrl }}
                    className="w-12 h-12 rounded-xl mr-3 bg-slate-100"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-800">{sub.product.name}</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <Clock size={11} color={theme.colors.textMuted} />
                      <Text className="text-xs text-slate-500">
                        {sub.time} · {sub.qty} {sub.product.unit} · {sub.freq}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <Calendar size={11} color={theme.colors.textMuted} />
                      <Text className="text-xs text-slate-500">Started {sub.startDate}</Text>
                    </View>
                  </View>
                  <View
                    className={`px-2.5 py-1 rounded-full ${
                      sub.status === 'Active' ? 'bg-emerald-100' : 'bg-amber-100'
                    }`}
                  >
                    <Text
                      className={`text-2xs font-bold ${
                        sub.status === 'Active' ? 'text-emerald-800' : 'text-amber-800'
                      }`}
                    >
                      {sub.status}
                    </Text>
                  </View>
                </View>

                <View className="h-px bg-slate-100 my-3" />

                <View className="flex-row gap-2">
                  <SubscriptionButton
                    title={skippedToday ? 'Resume' : 'Skip Today'}
                    size="small"
                    variant={skippedToday ? 'primary' : 'outline'}
                    onPress={() => handleSkip(sub.id)}
                    className="flex-1"
                  />
                  <SubscriptionButton
                    title={sub.status === 'Paused' ? 'Resume' : 'Pause'}
                    size="small"
                    variant={sub.status === 'Paused' ? 'primary' : 'secondary'}
                    onPress={() => handlePause(sub.id)}
                    className="flex-1"
                  />
                  <SubscriptionButton
                    title="Cancel"
                    size="small"
                    variant="danger"
                    onPress={() => handleCancel(sub.id)}
                    className="flex-[0.8]"
                  />
                </View>
              </View>
            );
          })}

        {(subTab === 'History' || subscriptions.length === 0) && (
          <View className="items-center py-8 px-4">
            <Package size={44} color={theme.colors.textMuted} />
            <Text className="text-slate-800 text-sm font-bold mt-3">
              {subTab === 'History' ? 'No past subscriptions' : 'No active recurring deliveries'}
            </Text>
            <Text className="text-slate-500 text-xs text-center mt-1 max-w-[260px]">
              Set up automated morning deliveries of fresh milk, veggies, and daily organic staples.
            </Text>
            <SubscriptionButton
              title="Explore Plans & Subscribe"
              icon={<Sprout size={16} color="#FFFFFF" />}
              variant="primary"
              size="large"
              onPress={onExplorePlans}
              className="mt-5 min-w-[240px]"
              badge="SAVE 10%"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};
