import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AdminUserLog } from '../../constants/mockData';
import { API_ENDPOINTS } from '../../services';
import { C, Chip, SectionHeader, TypeIcon, fmtDate } from './types';

export const AdminLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<AdminUserLog[]>([]);
  const [filter, setFilter] = useState('All');
  const types = ['All', 'create', 'update', 'delete', 'login', 'logout', 'view'];

  const loadLogs = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.userLogs);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(
          data.map((l: any) => ({
            id: String(l.id),
            user: l.user?.name || l.userName || l.user || 'Admin',
            role: l.role || 'Admin',
            action: l.action || 'Performed action',
            module: l.module || 'Dashboard',
            type: (l.type || 'view').toLowerCase(),
            timestamp: l.timestamp || l.createdAt || new Date().toISOString(),
          }))
        );
      }
    } catch (e) {
      console.warn('Failed to fetch user logs:', e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = filter === 'All' ? logs : logs.filter((l) => l.type === filter);

  const dotColor = (t: string) => {
    switch (t) {
      case 'create':
        return C.success;
      case 'delete':
        return C.danger;
      case 'login':
        return C.purple;
      case 'logout':
        return C.textMuted;
      case 'update':
        return C.info;
      default:
        return C.warning;
    }
  };

  return (
    <View className="flex-1">
      <SectionHeader
        title={`User Logs (${logs.length})`}
        sub="Full activity & audit trail"
      />
      {/* Summary row */}
      <View className="flex-row gap-2 mb-3.5">
        {[
          {
            val: logs.filter((l) => l.type === 'create').length,
            lbl: 'Created',
            color: C.success,
          },
          {
            val: logs.filter((l) => l.type === 'update').length,
            lbl: 'Updated',
            color: C.info,
          },
          {
            val: logs.filter((l) => l.type === 'delete').length,
            lbl: 'Deleted',
            color: C.danger,
          },
          {
            val: logs.filter((l) => l.type === 'login').length,
            lbl: 'Logins',
            color: C.purple,
          },
        ].map((stat) => (
          <View
            key={stat.lbl}
            className="flex-1 bg-[#F7FAF8] border border-[#E2EBE6] rounded-xl p-2.5 items-center"
          >
            <Text className="text-lg font-extrabold" style={{ color: stat.color }}>
              {stat.val}
            </Text>
            <Text className="text-2xs text-[#9aada6] mt-0.5">{stat.lbl}</Text>
          </View>
        ))}
      </View>
      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2.5"
      >
        {types.map((t) => (
          <TouchableOpacity
            key={t}
            className={`py-1.5 px-3.5 rounded-full border mr-1.5 ${
              filter === t
                ? 'bg-[#0D2B1D] border-[#0D2B1D]'
                : 'bg-white border-[#E2EBE6]'
            }`}
            onPress={() => setFilter(t)}
          >
            <View className="flex-row items-center gap-1">
              {t !== 'All' && (
                <TypeIcon
                  type={t}
                  size={11}
                  color={filter === t ? '#fff' : C.textSec}
                />
              )}
              <Text
                className={`text-xs font-semibold ${
                  filter === t ? 'text-white font-bold' : 'text-[#5a6a63]'
                }`}
              >
                {t === 'All' ? 'All' : t}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((log) => (
          <View
            key={log.id}
            className="flex-row items-start gap-2.5 py-2.5 border-b border-[#E2EBE6]"
          >
            <View
              className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
              style={{ backgroundColor: dotColor(log.type) }}
            />
            <View className="flex-1">
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                  <TypeIcon type={log.type} size={13} color={dotColor(log.type)} />
                  <Text
                    className="flex-1 text-sm font-semibold text-[#1a1a2e]"
                    numberOfLines={2}
                  >
                    {log.action}
                  </Text>
                </View>
                <Chip label={log.module} color={C.textSec} small />
              </View>
              <Text className="text-xs text-[#5a6a63] mt-0.5">
                {log.user} · {log.role}
              </Text>
              <Text className="text-xs text-[#9aada6] mt-0.5">
                {fmtDate(log.timestamp)}
              </Text>
            </View>
          </View>
        ))}
        {filtered.length === 0 && (
          <Text className="text-center text-[#9aada6] text-sm py-10">
            No logs in this filter
          </Text>
        )}
        <View className="h-5" />
      </ScrollView>
    </View>
  );
};
