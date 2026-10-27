import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Award, MapPin, Star, Pencil, Trash2, Plus } from 'lucide-react-native';
import { AdminBrand } from '../../constants/mockData';
import { API_ENDPOINTS } from '../../services/api.client';
import { C, SectionHeader } from './types';

export const AdminBrandsScreen: React.FC = () => {
  const [items, setItems] = useState<AdminBrand[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState({ name: '', origin: '', rating: '4.5' });
  const [editId, setEditId] = useState<string | null>(null);

  const loadBrands = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.brands);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(
          data.map((b: any) => ({
            id: String(b.id),
            name: b.name || 'Brand',
            emoji: '',
            origin: b.origin || 'India',
            rating: Number(b.rating) || 4.5,
            productCount: b._count?.products || b.productCount || 0,
          }))
        );
      }
    } catch (e) {
      console.warn('Failed to fetch brands:', e);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openAdd = () => {
    setForm({ name: '', origin: '', rating: '4.5' });
    setEditId(null);
    setModal('add');
  };

  const openEdit = (b: AdminBrand) => {
    setForm({ name: b.name, origin: b.origin, rating: String(b.rating) });
    setEditId(b.id);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Brand name is required.');
      return;
    }
    if (editId) {
      try {
        await fetch(`${API_ENDPOINTS.brands}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            origin: form.origin,
            rating: parseFloat(form.rating),
          }),
        });
      } catch (e) {}
    } else {
      try {
        await fetch(API_ENDPOINTS.brands, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            origin: form.origin,
            rating: parseFloat(form.rating),
          }),
        });
      } catch (e) {}
    }
    setModal(null);
    loadBrands();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Brand', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${API_ENDPOINTS.brands}/${id}`, { method: 'DELETE' });
          } catch (e) {}
          loadBrands();
        },
      },
    ]);
  };

  return (
    <View className="flex-1">
      <SectionHeader title={`Brands (${items.length})`} action={{ label: '+ Add', onPress: openAdd }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map(b => (
          <View
            key={b.id}
            className="bg-white rounded-xl p-3 mb-2 flex-row items-center border border-[#E2EBE6] shadow-sm"
          >
            <View className="w-11 h-11 rounded-xl bg-[#F7FAF8] items-center justify-center">
              <Award size={20} color={C.primary} strokeWidth={2.2} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm font-bold text-[#1a1a2e]">{b.name}</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <MapPin size={11} color={C.textMuted} />
                <Text className="text-xs text-[#5a6a63]">
                  {b.origin} · {b.productCount} products
                </Text>
              </View>
            </View>
            <View className="items-end gap-1.5">
              <View className="py-0.5 px-2 rounded-full border bg-[#FEF3C7] border-[#FDE68A] flex-row items-center gap-1">
                <Star size={10} color="#B45309" fill="#B45309" />
                <Text className="text-2xs font-extrabold text-[#B45309]">{b.rating}</Text>
              </View>
              <View className="flex-row gap-1.5">
                <TouchableOpacity
                  className="p-1 px-2.5 rounded-lg bg-[#F7FAF8] border border-[#E2EBE6]"
                  onPress={() => openEdit(b)}
                >
                  <Pencil size={13} color={C.textSec} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-1 px-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]"
                  onPress={() => handleDelete(b.id)}
                >
                  <Trash2 size={13} color={C.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <View className="h-5" />
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setModal(null)}
        >
          <View
            className="bg-white rounded-t-3xl p-5 pb-8 max-h-[85%]"
            onStartShouldSetResponder={() => true}
          >
            <View className="w-9 h-1 bg-[#E2EBE6] rounded-full self-center mb-4" />
            <View className="flex-row items-center gap-2 mb-4">
              {modal === 'add' ? (
                <Plus size={18} color={C.primary} strokeWidth={2.5} />
              ) : (
                <Pencil size={18} color={C.primary} strokeWidth={2.5} />
              )}
              <Text className="text-base font-extrabold text-[#1a1a2e]">
                {modal === 'add' ? 'Add Brand' : 'Edit Brand'}
              </Text>
            </View>
            <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
              Brand Name *
            </Text>
            <TextInput
              className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
              value={form.name}
              onChangeText={v => setForm({ ...form, name: v })}
              placeholder="e.g. NatureFarm"
              placeholderTextColor={C.textMuted}
            />
            <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
              Origin State
            </Text>
            <TextInput
              className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
              value={form.origin}
              onChangeText={v => setForm({ ...form, origin: v })}
              placeholder="e.g. Tamil Nadu"
              placeholderTextColor={C.textMuted}
            />
            <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-2.5">
              Rating (1–5)
            </Text>
            <TextInput
              className="border border-[#E2EBE6] rounded-xl px-3 h-11 text-sm text-[#1a1a2e] bg-[#F7FAF8]"
              value={form.rating}
              onChangeText={v => setForm({ ...form, rating: v })}
              keyboardType="decimal-pad"
              placeholder="4.5"
              placeholderTextColor={C.textMuted}
            />
            <View className="flex-row gap-2.5 mt-3">
              <TouchableOpacity
                className="flex-1 h-11 rounded-full items-center justify-center bg-[#F7FAF8] border border-[#E2EBE6]"
                onPress={() => setModal(null)}
              >
                <Text className="text-[#5a6a63] font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-11 rounded-full items-center justify-center bg-[#0D2B1D]"
                onPress={handleSave}
              >
                <Text className="text-white font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
