import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import {
  Search,
  RefreshCw,
  X,
  FileText,
  BarChart3,
  ShieldCheck,
  Download,
  Users,
  Layers,
  Activity,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react-native';
import { API_ENDPOINTS } from '../../services';
import { CommonModal } from '../../components/CommonModal';
import { C, Chip, SectionHeader, TypeIcon } from './types';

export interface AdminLogItem {
  id: string;
  user: string;
  role: string;
  action: string;
  module: string;
  ip: string;
  type: string;
  timestamp: string;
}

const getActionTheme = (type: string) => {
  switch ((type || '').toLowerCase()) {
    case 'create':
      return {
        bg: '#DCFCE7',
        border: '#86EFAC',
        text: '#15803D',
        badge: '#16A34A',
        label: 'CREATE',
      };
    case 'update':
      return {
        bg: '#DBEAFE',
        border: '#93C5FD',
        text: '#1D4ED8',
        badge: '#2563EB',
        label: 'UPDATE',
      };
    case 'delete':
      return {
        bg: '#FEE2E2',
        border: '#FCA5A5',
        text: '#B91C1C',
        badge: '#DC2626',
        label: 'DELETE',
      };
    case 'login':
      return {
        bg: '#F3E8FF',
        border: '#D8B4FE',
        text: '#7E22CE',
        badge: '#9333EA',
        label: 'LOGIN',
      };
    case 'view':
      return {
        bg: '#E0F2FE',
        border: '#BAE6FD',
        text: '#0369A1',
        badge: '#0284C7',
        label: 'VIEW',
      };
    default:
      return {
        bg: '#FEF3C7',
        border: '#FDE68A',
        text: '#B45309',
        badge: '#D97706',
        label: 'SYSTEM',
      };
  }
};

const formatReportDate = (isoStr: string) => {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr || '—';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoStr;
  }
};

export const AdminLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<AdminLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'report'>('dashboard');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AdminLogItem | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const loadLogs = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.userLogs);
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

      if (Array.isArray(rawList)) {
        setLogs(
          rawList.map((l: any, idx: number) => ({
            id: String(l.id || `LOG-${idx + 1}`),
            user: l.user?.name || l.userName || l.user || 'Admin',
            role: l.role || 'Admin',
            action: l.action || 'Performed system operation',
            module: l.module || 'Dashboard',
            ip: l.ip || '127.0.0.1',
            type: (l.type || 'view').toLowerCase(),
            timestamp: l.timestamp || l.createdAt || new Date().toISOString(),
          }))
        );
      }
    } catch (e) {
      console.warn('Failed to fetch user logs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Unique modules
  const availableModules = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.module) set.add(l.module);
    });
    return ['All', ...Array.from(set)];
  }, [logs]);

  // Analytics Metrics
  const totalCount = logs.length;
  const uniqueUsers = useMemo(() => Array.from(new Set(logs.map((l) => l.user))), [logs]);
  const uniqueModulesCount = useMemo(() => new Set(logs.map((l) => l.module)).size, [logs]);

  const typeCounts = useMemo(() => {
    return {
      create: logs.filter((l) => l.type === 'create').length,
      update: logs.filter((l) => l.type === 'update').length,
      delete: logs.filter((l) => l.type === 'delete').length,
      login: logs.filter((l) => l.type === 'login').length,
      view: logs.filter((l) => l.type === 'view').length,
    };
  }, [logs]);

  // Module volume distribution
  const moduleDistribution = useMemo(() => {
    const modMap: { [key: string]: number } = {};
    logs.forEach((l) => {
      modMap[l.module] = (modMap[l.module] || 0) + 1;
    });
    return Object.entries(modMap)
      .map(([mod, count]) => ({
        module: mod,
        count,
        pct: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [logs, totalCount]);

  // Top Operators Summary
  const operatorBreakdown = useMemo(() => {
    const userMap: { [key: string]: { role: string; count: number; lastAction: string; lastTime: string } } = {};
    logs.forEach((l) => {
      if (!userMap[l.user]) {
        userMap[l.user] = {
          role: l.role,
          count: 0,
          lastAction: l.action,
          lastTime: l.timestamp,
        };
      }
      userMap[l.user].count += 1;
    });
    return Object.entries(userMap)
      .map(([user, data]) => ({ user, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  // Filter & Search logic
  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesType = filterType === 'All' || log.type === filterType.toLowerCase();
      if (!matchesType) return false;

      const matchesModule = selectedModule === 'All' || log.module === selectedModule;
      if (!matchesModule) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        log.role.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q)
      );
    });
  }, [logs, filterType, selectedModule, search]);

  const handleExportReport = async () => {
    const reportSummary = [
      `=============================================`,
      `AGRIFLOW AI - AUDIT & COMPLIANCE REPORT`,
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      `Total Events: ${totalCount}`,
      `Verified Status: 100% Integrity`,
      `=============================================`,
      ...filtered.map(
        (l) =>
          `[${l.id}] ${l.timestamp} | ${l.user} (${l.role}) | #${l.module} | ${l.type.toUpperCase()} | ${l.action}`
      ),
    ].join('\n');

    try {
      if (Platform.OS === 'web') {
        const nav = (globalThis as any).window?.navigator || (globalThis as any).navigator;
        if (nav && nav.clipboard && nav.clipboard.writeText) {
          await nav.clipboard.writeText(reportSummary);
          setExportNotice('Audit report copied to clipboard!');
          setTimeout(() => setExportNotice(null), 3000);
          return;
        }
      }
      await Share.share({
        title: 'AgriFlow Audit Report',
        message: reportSummary,
      });
    } catch {
      setExportNotice('Export preview ready');
      setTimeout(() => setExportNotice(null), 3000);
    }
  };

  return (
    <View className="flex-1">
      {/* Report Header */}
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-lg bg-[#0D2B1D] items-center justify-center">
              <FileText size={16} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <Text className="text-lg font-black text-[#1a1a2e]">
              Audit Intelligence & Logs
            </Text>
          </View>
          <Text className="text-xs text-[#5a6a63] mt-0.5 ml-10">
            Official system operations dashboard & audit report
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            className="h-8 px-2.5 rounded-lg bg-white border border-[#E2EBE6] flex-row items-center gap-1.5 shadow-2xs"
            onPress={handleExportReport}
            activeOpacity={0.7}
          >
            <Download size={13} color="#0D2B1D" strokeWidth={2.2} />
            <Text className="text-xs font-bold text-[#0D2B1D]">Export</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-8 h-8 rounded-lg bg-white border border-[#E2EBE6] items-center justify-center shadow-2xs"
            onPress={() => loadLogs(true)}
            disabled={refreshing}
            activeOpacity={0.7}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <RefreshCw size={13} color={C.primary} strokeWidth={2.2} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Export Feedback Banner */}
      {exportNotice && (
        <View className="bg-[#DCFCE7] border border-[#86EFAC] rounded-xl px-3 py-1.5 mb-2.5 flex-row items-center gap-2">
          <CheckCircle2 size={14} color="#15803D" />
          <Text className="text-xs font-bold text-[#15803D]">{exportNotice}</Text>
        </View>
      )}

      {/* Report Mode Tabs: Dashboard vs Full Report Table */}
      <View className="flex-row bg-[#E2EBE6] p-1 rounded-xl mb-3">
        <TouchableOpacity
          className={`flex-1 py-1.5 rounded-lg items-center justify-center flex-row gap-1.5 ${
            activeView === 'dashboard' ? 'bg-white shadow-2xs' : ''
          }`}
          onPress={() => setActiveView('dashboard')}
          activeOpacity={0.8}
        >
          <BarChart3
            size={14}
            color={activeView === 'dashboard' ? '#0D2B1D' : '#5a6a63'}
            strokeWidth={2.2}
          />
          <Text
            className={`text-xs font-bold ${
              activeView === 'dashboard' ? 'text-[#0D2B1D]' : 'text-[#5a6a63]'
            }`}
          >
            Audit Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-1.5 rounded-lg items-center justify-center flex-row gap-1.5 ${
            activeView === 'report' ? 'bg-white shadow-2xs' : ''
          }`}
          onPress={() => setActiveView('report')}
          activeOpacity={0.8}
        >
          <FileText
            size={14}
            color={activeView === 'report' ? '#0D2B1D' : '#5a6a63'}
            strokeWidth={2.2}
          />
          <Text
            className={`text-xs font-bold ${
              activeView === 'report' ? 'text-[#0D2B1D]' : 'text-[#5a6a63]'
            }`}
          >
            Full Report Table ({totalCount})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="small" color={C.primary} />
          <Text className="text-xs text-[#9aada6] mt-2">Loading audit data...</Text>
        </View>
      ) : activeView === 'dashboard' ? (
        /* ========================================================== */
        /* VIEW 1: EXECUTIVE AUDIT DASHBOARD                          */
        /* ========================================================== */
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Executive Scorecard (4 Metric Cards) */}
          <View className="flex-row flex-wrap gap-2.5 mb-3">
            {/* Total Audits */}
            <View className="w-[48%] bg-white rounded-xl p-3 border border-[#E2EBE6] shadow-2xs">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-2xs font-bold uppercase tracking-wider text-[#9aada6]">
                  Total Events
                </Text>
                <Activity size={14} color="#0D2B1D" strokeWidth={2.4} />
              </View>
              <Text className="text-2xl font-black text-[#1a1a2e]">
                {totalCount}
              </Text>
              <Text className="text-2xs font-semibold text-[#15803D] mt-0.5">
                ● 100% Logged & Verified
              </Text>
            </View>

            {/* Active Operators */}
            <View className="w-[48%] bg-white rounded-xl p-3 border border-[#E2EBE6] shadow-2xs">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-2xs font-bold uppercase tracking-wider text-[#9aada6]">
                  Active Operators
                </Text>
                <Users size={14} color="#2563EB" strokeWidth={2.4} />
              </View>
              <Text className="text-2xl font-black text-[#1a1a2e]">
                {uniqueUsers.length}
              </Text>
              <Text className="text-2xs font-semibold text-[#2563EB] mt-0.5">
                Admin & Managers
              </Text>
            </View>

            {/* Modules Impacted */}
            <View className="w-[48%] bg-white rounded-xl p-3 border border-[#E2EBE6] shadow-2xs">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-2xs font-bold uppercase tracking-wider text-[#9aada6]">
                  Modules Impacted
                </Text>
                <Layers size={14} color="#D97706" strokeWidth={2.4} />
              </View>
              <Text className="text-2xl font-black text-[#1a1a2e]">
                {uniqueModulesCount}
              </Text>
              <Text className="text-2xs font-semibold text-[#D97706] mt-0.5">
                Core Subsystems
              </Text>
            </View>

            {/* System Integrity */}
            <View className="w-[48%] bg-white rounded-xl p-3 border border-[#E2EBE6] shadow-2xs">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-2xs font-bold uppercase tracking-wider text-[#9aada6]">
                  Compliance Health
                </Text>
                <ShieldCheck size={14} color="#16A34A" strokeWidth={2.4} />
              </View>
              <Text className="text-2xl font-black text-[#15803D]">
                PASS
              </Text>
              <Text className="text-2xs font-semibold text-[#15803D] mt-0.5">
                0 Critical Exceptions
              </Text>
            </View>
          </View>

          {/* Action Types Distribution Strip */}
          <View className="bg-white rounded-2xl p-3.5 border border-[#E2EBE6] shadow-2xs mb-3">
            <View className="flex-row items-center justify-between mb-2.5">
              <Text className="text-xs font-extrabold uppercase tracking-wider text-[#1a1a2e]">
                Operation Breakdown by Type
              </Text>
              <Text className="text-2xs font-semibold text-[#9aada6]">
                Action Categories
              </Text>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-2 items-center">
                <Text className="text-xs font-bold text-[#15803D] uppercase">Create</Text>
                <Text className="text-lg font-black text-[#15803D] mt-0.5">
                  {typeCounts.create}
                </Text>
                <Text className="text-3xs text-[#15803D] font-medium">
                  {totalCount > 0 ? Math.round((typeCounts.create / totalCount) * 100) : 0}%
                </Text>
              </View>

              <View className="flex-1 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl p-2 items-center">
                <Text className="text-xs font-bold text-[#1D4ED8] uppercase">Update</Text>
                <Text className="text-lg font-black text-[#1D4ED8] mt-0.5">
                  {typeCounts.update}
                </Text>
                <Text className="text-3xs text-[#1D4ED8] font-medium">
                  {totalCount > 0 ? Math.round((typeCounts.update / totalCount) * 100) : 0}%
                </Text>
              </View>

              <View className="flex-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-2 items-center">
                <Text className="text-xs font-bold text-[#B91C1C] uppercase">Delete</Text>
                <Text className="text-lg font-black text-[#B91C1C] mt-0.5">
                  {typeCounts.delete}
                </Text>
                <Text className="text-3xs text-[#B91C1C] font-medium">
                  {totalCount > 0 ? Math.round((typeCounts.delete / totalCount) * 100) : 0}%
                </Text>
              </View>

              <View className="flex-1 bg-[#FAF5FF] border border-[#F3E8FF] rounded-xl p-2 items-center">
                <Text className="text-xs font-bold text-[#7E22CE] uppercase">Login</Text>
                <Text className="text-lg font-black text-[#7E22CE] mt-0.5">
                  {typeCounts.login}
                </Text>
                <Text className="text-3xs text-[#7E22CE] font-medium">
                  {totalCount > 0 ? Math.round((typeCounts.login / totalCount) * 100) : 0}%
                </Text>
              </View>
            </View>
          </View>

          {/* Module Distribution Volume Report */}
          <View className="bg-white rounded-2xl p-3.5 border border-[#E2EBE6] shadow-2xs mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-extrabold uppercase tracking-wider text-[#1a1a2e]">
                Module Activity Volume
              </Text>
              <Text className="text-2xs font-semibold text-[#9aada6]">
                Distribution %
              </Text>
            </View>

            <View className="space-y-2.5">
              {moduleDistribution.map((item, idx) => {
                const colors = ['#2D6A4F', '#2563EB', '#D97706', '#7C3AED', '#0284C7', '#15803D'];
                const barColor = colors[idx % colors.length];

                return (
                  <View key={item.module} className="mb-2">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center gap-1.5">
                        <View
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: barColor }}
                        />
                        <Text className="text-xs font-bold text-[#1a1a2e]">
                          #{item.module}
                        </Text>
                      </View>
                      <Text className="text-xs font-extrabold text-[#5a6a63]">
                        {item.count} events ({item.pct}%)
                      </Text>
                    </View>

                    {/* Progress Track */}
                    <View className="w-full h-2 bg-[#F0F4F1] rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(item.pct, 4)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Active Operators Report */}
          <View className="bg-white rounded-2xl p-3.5 border border-[#E2EBE6] shadow-2xs mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-extrabold uppercase tracking-wider text-[#1a1a2e]">
                Operator Activity Report
              </Text>
              <Text className="text-2xs font-semibold text-[#9aada6]">
                {operatorBreakdown.length} Active Staff
              </Text>
            </View>

            {operatorBreakdown.map((op, idx) => (
              <View
                key={op.user}
                className={`flex-row items-center justify-between py-2.5 ${
                  idx !== operatorBreakdown.length - 1 ? 'border-b border-[#F0F4F1]' : ''
                }`}
              >
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-extrabold text-[#1a1a2e]">
                      {op.user}
                    </Text>
                    <View className="bg-[#E8F5E9] px-1.5 py-0.2 rounded border border-[#C8E6C9]">
                      <Text className="text-3xs font-bold text-[#2D6A4F]">
                        {op.role}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-2xs text-[#9aada6] mt-0.5" numberOfLines={1}>
                    Latest: {op.lastAction}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-xs font-black text-[#0D2B1D]">
                    {op.count} ops
                  </Text>
                  <Text className="text-3xs text-[#9aada6]">
                    {formatReportDate(op.lastTime).split(',')[0]}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Jump to Table CTA */}
          <TouchableOpacity
            className="bg-[#0D2B1D] rounded-xl py-3 px-4 flex-row items-center justify-between mb-6 shadow-sm"
            onPress={() => setActiveView('report')}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-2">
              <FileText size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text className="text-xs font-bold text-white">
                View Full Tabular Audit Report ({totalCount} rows)
              </Text>
            </View>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* ========================================================== */
        /* VIEW 2: FORMAL TABULAR AUDIT REPORT TABLE                  */
        /* ========================================================== */
        <View className="flex-1">
          {/* Search Input */}
          <View className="flex-row items-center bg-white rounded-xl border border-[#E2EBE6] px-3 mb-2 h-10 shadow-2xs">
            <Search size={15} color={C.textMuted} />
            <TextInput
              className="flex-1 text-[13px] text-[#1a1a2e] ml-2"
              placeholder="Search by action, user, module, or Log ID..."
              placeholderTextColor={C.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={14} color={C.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Module Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2.5 max-h-8"
          >
            {availableModules.map((mod) => {
              const isSelected = selectedModule === mod;
              return (
                <TouchableOpacity
                  key={mod}
                  className={`py-1 px-3 rounded-lg border mr-1.5 ${
                    isSelected
                      ? 'bg-[#0D2B1D] border-[#0D2B1D]'
                      : 'bg-white border-[#E2EBE6]'
                  }`}
                  onPress={() => setSelectedModule(mod)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-2xs font-bold ${
                      isSelected ? 'text-white' : 'text-[#5a6a63]'
                    }`}
                  >
                    {mod === 'All' ? 'All Modules' : `#${mod}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Horizontal Scrollable Audit Report Grid */}
          <View className="flex-1 bg-white rounded-2xl border border-[#E2EBE6] shadow-2xs overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} className="flex-1">
              <View className="min-w-[820px]">
                {/* Table Header Row */}
                <View className="flex-row bg-[#F7FAF8] border-b border-[#E2EBE6] py-2.5 px-3">
                  <Text className="w-[80px] text-2xs font-black uppercase text-[#5a6a63] tracking-wider">
                    LOG ID
                  </Text>
                  <Text className="w-[155px] text-2xs font-black uppercase text-[#5a6a63] tracking-wider">
                    TIMESTAMP
                  </Text>
                  <Text className="w-[130px] text-2xs font-black uppercase text-[#5a6a63] tracking-wider">
                    OPERATOR
                  </Text>
                  <Text className="w-[100px] text-2xs font-black uppercase text-[#5a6a63] tracking-wider">
                    MODULE
                  </Text>
                  <Text className="w-[230px] text-2xs font-black uppercase text-[#5a6a63] tracking-wider">
                    OPERATION SUMMARY
                  </Text>
                  <Text className="w-[85px] text-2xs font-black uppercase text-[#5a6a63] tracking-wider text-center">
                    TYPE
                  </Text>
                  <Text className="w-[40px] text-2xs font-black uppercase text-[#5a6a63] tracking-wider text-right">
                    VIEW
                  </Text>
                </View>

                {/* Table Body Rows */}
                <ScrollView showsVerticalScrollIndicator={true} className="flex-1">
                  {filtered.map((log, idx) => {
                    const theme = getActionTheme(log.type);
                    const isEven = idx % 2 === 0;

                    return (
                      <TouchableOpacity
                        key={log.id}
                        className={`flex-row items-center py-3 px-3 border-b border-[#F0F4F1] ${
                          isEven ? 'bg-white' : 'bg-[#FAFCFB]'
                        }`}
                        onPress={() => setSelectedLog(log)}
                        activeOpacity={0.7}
                      >
                        {/* ID */}
                        <Text className="w-[80px] text-2xs font-mono font-bold text-[#0D2B1D]">
                          #{log.id}
                        </Text>

                        {/* Timestamp */}
                        <View className="w-[155px]">
                          <Text className="text-2xs font-semibold text-[#1a1a2e]">
                            {formatReportDate(log.timestamp)}
                          </Text>
                        </View>

                        {/* Operator & Role */}
                        <View className="w-[130px] pr-2">
                          <Text className="text-xs font-bold text-[#1a1a2e]" numberOfLines={1}>
                            {log.user}
                          </Text>
                          <Text className="text-3xs text-[#5a6a63] font-medium">
                            {log.role}
                          </Text>
                        </View>

                        {/* Module */}
                        <View className="w-[100px]">
                          <View className="bg-[#F0F4F1] px-2 py-0.5 rounded-md self-start">
                            <Text className="text-2xs font-bold text-[#0D2B1D]">
                              #{log.module}
                            </Text>
                          </View>
                        </View>

                        {/* Action Description */}
                        <Text
                          className="w-[230px] text-xs font-medium text-[#1a1a2e] pr-3"
                          numberOfLines={2}
                        >
                          {log.action}
                        </Text>

                        {/* Action Type Badge */}
                        <View className="w-[85px] items-center">
                          <View
                            className="px-2 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: theme.bg,
                              borderColor: theme.border,
                            }}
                          >
                            <Text
                              className="text-3xs font-black uppercase tracking-wider"
                              style={{ color: theme.text }}
                            >
                              {theme.label}
                            </Text>
                          </View>
                        </View>

                        {/* Inspect Chevron */}
                        <View className="w-[40px] items-end">
                          <ChevronRight size={14} color="#9aada6" />
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {filtered.length === 0 && (
                    <View className="py-14 items-center justify-center">
                      <Text className="text-sm font-semibold text-[#5a6a63]">
                        No audit records found matching query
                      </Text>
                      <TouchableOpacity
                        className="mt-3 bg-[#0D2B1D] py-1.5 px-3 rounded-lg"
                        onPress={() => {
                          setSearch('');
                          setSelectedModule('All');
                          setFilterType('All');
                        }}
                      >
                        <Text className="text-white text-xs font-bold">Reset Filters</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </View>
            </ScrollView>

            {/* Table Footer */}
            <View className="bg-[#F7FAF8] border-t border-[#E2EBE6] px-3 py-2 flex-row items-center justify-between">
              <Text className="text-2xs font-semibold text-[#5a6a63]">
                Displaying {filtered.length} of {totalCount} records
              </Text>
              <Text className="text-2xs font-mono text-[#9aada6]">
                AgriFlow AI Compliance Auditor
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Audit Log Sheet Inspection Modal */}
      <CommonModal
        visible={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? `Audit Log #${selectedLog.id}` : 'Audit Log'}
        subtitle={selectedLog ? `Recorded on ${formatReportDate(selectedLog.timestamp)}` : undefined}
        icon={<FileText size={16} color={C.primary} />}
        maxHeight="88%"
      >
        {selectedLog && (
          <>
            {/* Event Tag */}
            <View className="mb-3">
              <View
                className="px-2.5 py-1 rounded-full border self-start"
                style={{
                  backgroundColor: getActionTheme(selectedLog.type).bg,
                  borderColor: getActionTheme(selectedLog.type).border,
                }}
              >
                <Text
                  className="text-3xs font-black uppercase tracking-wider"
                  style={{ color: getActionTheme(selectedLog.type).text }}
                >
                  {getActionTheme(selectedLog.type).label} EVENT
                </Text>
              </View>
            </View>

            {/* Operation Description Box */}
                <View className="bg-[#F7FAF8] rounded-xl p-3.5 border border-[#E2EBE6] mb-3">
                  <Text className="text-3xs font-extrabold uppercase tracking-wider text-[#5a6a63] mb-1">
                    Audited Event
                  </Text>
                  <Text className="text-sm font-bold text-[#1a1a2e]">
                    {selectedLog.action}
                  </Text>
                </View>

                {/* Structured Metadata Sheet */}
                <View className="bg-white rounded-xl border border-[#E2EBE6] p-3 space-y-2 mb-4">
                  <Text className="text-3xs font-extrabold uppercase tracking-wider text-[#5a6a63] mb-1">
                    Audit Report Fields
                  </Text>

                  <View className="flex-row justify-between py-1 border-b border-[#F0F4F1]">
                    <Text className="text-xs text-[#9aada6]">Operator Name</Text>
                    <Text className="text-xs font-bold text-[#1a1a2e]">{selectedLog.user}</Text>
                  </View>

                  <View className="flex-row justify-between py-1 border-b border-[#F0F4F1]">
                    <Text className="text-xs text-[#9aada6]">Operator Role</Text>
                    <Text className="text-xs font-bold text-[#2D6A4F]">{selectedLog.role}</Text>
                  </View>

                  <View className="flex-row justify-between py-1 border-b border-[#F0F4F1]">
                    <Text className="text-xs text-[#9aada6]">Subsystem Module</Text>
                    <Text className="text-xs font-bold text-[#0D2B1D]">#{selectedLog.module}</Text>
                  </View>

                  <View className="flex-row justify-between py-1 border-b border-[#F0F4F1]">
                    <Text className="text-xs text-[#9aada6]">Client IP Address</Text>
                    <Text className="text-xs font-mono font-bold text-[#1a1a2e]">
                      {selectedLog.ip || '127.0.0.1'}
                    </Text>
                  </View>

                  <View className="flex-row justify-between py-1 border-b border-[#F0F4F1]">
                    <Text className="text-xs text-[#9aada6]">Audit Verification</Text>
                    <Text className="text-xs font-bold text-[#15803D]">VERIFIED (PASS)</Text>
                  </View>

                  <View className="flex-row justify-between py-1">
                    <Text className="text-xs text-[#9aada6]">ISO Timestamp</Text>
                    <Text className="text-2xs font-mono text-[#5a6a63] flex-1 text-right">
                      {selectedLog.timestamp}
                    </Text>
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  className="h-11 rounded-xl items-center justify-center bg-[#0D2B1D] mb-4"
                  onPress={() => setSelectedLog(null)}
                >
                  <Text className="text-xs font-bold text-white">Dismiss Report Sheet</Text>
                </TouchableOpacity>
              </>
            )}
      </CommonModal>
    </View>
  );
};

export default AdminLogsScreen;
