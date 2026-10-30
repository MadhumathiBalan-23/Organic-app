import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  Sprout,
  CircleCheck,
} from 'lucide-react-native';
import { Product } from '../../constants/mockData';
import { API_ENDPOINTS } from '../../services';
import {
  VC,
  VendorTabKey,
  VendorScreensProps,
  VendorProfile,
  VendorHarvestItem,
  getCategoryName,
} from './types';
import { VendorDashboardScreen } from './VendorDashboardScreen';
import { VendorCropsScreen } from './VendorCropsScreen';
import { VendorOrdersScreen } from './VendorOrdersScreen';
import { VendorHarvestScreen } from './VendorHarvestScreen';
import { VendorPayoutsScreen } from './VendorPayoutsScreen';
import { AddCropModal } from './modals/AddCropModal';
import { AdminPinModal } from './modals/AdminPinModal';
import { DeliverySettingsModal } from './modals/DeliverySettingsModal';
import { AcceptOrderModal } from './modals/AcceptOrderModal';
import { RejectOrderModal } from './modals/RejectOrderModal';
import { DeliveryOtpModal } from './modals/DeliveryOtpModal';

export const VendorPortalScreen: React.FC<VendorScreensProps> = ({
  triggerRefresh,
  activeTab: propActiveTab,
  onSelectTab,
  onSwitchToCustomer,
  showAddModal,
  setShowAddModal,
  userPhone,
}) => {
  const [internalTab, setInternalTab] = useState<VendorTabKey>('dashboard');
  const activeTab: VendorTabKey =
    (propActiveTab as VendorTabKey) || internalTab;

  const setActiveTab = (tab: VendorTabKey) => {
    setInternalTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  // State for products, deliveries, and active vendor profile loaded live from API
  const [productList, setProductList] = useState<Product[]>([]);
  const [deliveriesList, setDeliveriesList] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);

  // Harvest Schedule data
  const [harvests] = useState<VendorHarvestItem[]>([
    {
      id: 'h1',
      crop: 'Organic Vine Tomatoes',
      expectedYield: '140 kg',
      harvestDate: 'Tomorrow, Oct 24',
      status: 'Ready',
      badgeColor: VC.success,
    },
    {
      id: 'h2',
      crop: 'Pure Desi Cow A2 Milk',
      expectedYield: '280 L',
      harvestDate: 'Daily Morning Flow',
      status: 'In Flow',
      badgeColor: VC.info,
    },
    {
      id: 'h3',
      crop: 'Wild Forest Raw Honey',
      expectedYield: '50 Jars',
      harvestDate: 'Oct 28',
      status: 'Maturing',
      badgeColor: VC.warning,
    },
    {
      id: 'h4',
      crop: 'Country Free-Range Eggs',
      expectedYield: '90 Crates',
      harvestDate: 'Daily Morning',
      status: 'Ready',
      badgeColor: VC.success,
    },
  ]);

  // Load products, deliveries, and vendor registration details on mount
  useEffect(() => {
    let isMounted = true;

    const cleanPhone = (userPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      // 1. Fetch authenticated Vendor profile
      fetch(API_ENDPOINTS.vendorByPhone(cleanPhone))
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success && json.data) {
            setVendorProfile({
              farmName: json.data.businessName || 'Organic Farm',
              farmLocation: json.data.address || 'Tamil Nadu',
              cropCategories: 'Fresh Organic Produce & Dairy',
              userName: json.data.ownerName || 'Partner Farmer',
            });
          } else {
            fetch(API_ENDPOINTS.vendorStatus(cleanPhone))
              .then((r) => r.json())
              .then((statusJson) => {
                if (isMounted && statusJson.success && statusJson.request) {
                  setVendorProfile({
                    farmName: statusJson.request.farmName,
                    farmLocation: statusJson.request.farmLocation,
                    cropCategories: statusJson.request.cropCategories,
                    userName: statusJson.request.userName,
                  });
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    // 2. Fetch ONLY products belonging to this vendor
    const prodUrl = cleanPhone ? API_ENDPOINTS.vendorProducts(cleanPhone) : API_ENDPOINTS.products;
    fetch(prodUrl)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data)) {
          const sanitized = json.data.map((p: any) => ({
            ...p,
            category: getCategoryName(p.category || p.categoryName),
          }));
          setProductList(sanitized);
        }
      })
      .catch(() => {});

    // 3. Fetch ONLY orders belonging to this vendor
    const ordersUrl = cleanPhone ? API_ENDPOINTS.vendorOrders(cleanPhone) : API_ENDPOINTS.orders;
    fetch(ordersUrl)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((o: any) => ({
            id: o.id,
            customerName: o.customerName || 'Customer',
            customerPhone: o.customerPhone,
            address: o.deliveryAddress,
            totalAmount: o.totalAmount,
            amount: o.totalAmount,
            status: o.deliveryStatus === 'PENDING_CONFIRMATION' ? 'Pending' : (o.deliveryStatus || 'Pending'),
            deliveryTime: o.deliverySlot || 'Standard Delivery',
            products: o.items && o.items.length > 0
              ? o.items.map((it: any) => `${it.product?.name || 'Item'} ×${it.quantity}`).join(', ')
              : 'Organic Harvest',
            items: o.items || [],
            createdAt: o.createdAt
          }));
          setDeliveriesList(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [userPhone]);

  // Non-disruptive inline toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Add Product Modal State
  const [internalShowModal, setInternalShowModal] = useState(false);
  const isAddModalOpen =
    showAddModal !== undefined ? showAddModal : internalShowModal;
  const setModalOpen = (open: boolean) => {
    setInternalShowModal(open);
    if (setShowAddModal) setShowAddModal(open);
  };

  // Delivery Configuration Modal State
  const [showDeliverySettings, setShowDeliverySettings] = useState(false);

  // Admin Pin Modal State
  const [adminAuthModal, setAdminAuthModal] = useState<{
    open: boolean;
    cropId: string;
    cropName: string;
  } | null>(null);

  // Accept / Reject / Delivery OTP verification modal states
  const [acceptModalOrder, setAcceptModalOrder] = useState<any | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [delivOtpModalOrder, setDelivOtpModalOrder] = useState<any | null>(null);

  // Crop stock adjust
  const handleStockAdjust = async (id: string, delta: number) => {
    let updatedStock = 0;
    setProductList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedStock = Math.max(0, item.stock + delta);
          return { ...item, stock: updatedStock };
        }
        return item;
      })
    );
    try {
      await fetch(`${API_ENDPOINTS.products}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: updatedStock }),
      });
    } catch {}
    triggerRefresh();
  };

  // Toggle crop stock status
  const handleToggleStockStatus = async (id: string) => {
    let newStock = 0;
    setProductList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          newStock = item.stock > 0 ? 0 : 30;
          showToast(
            newStock > 0
              ? `Crop marked Active (${newStock} ${item.unit}s)`
              : 'Crop marked Out of Stock'
          );
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
    try {
      await fetch(`${API_ENDPOINTS.products}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
    } catch {}
    triggerRefresh();
  };

  // Vendor attempt to delete: Only permitted with Admin Permission
  const handleRequestDeleteCrop = (id: string, name: string) => {
    Alert.alert(
      'Admin Permission Required',
      `Vendors do not have permission to delete crops from the catalog.\n\nOnly Super Admin has permission to delete "${name}".\n\nTo make this crop unavailable to customers, please mark it "Out of Stock".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Out of Stock',
          onPress: () => handleToggleStockStatus(id),
        },
        {
          text: 'Authorize as Admin',
          onPress: () => {
            setAdminAuthModal({ open: true, cropId: id, cropName: name });
          },
        },
      ]
    );
  };

  // Order status update
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    setDeliveriesList((prev) =>
      prev.map((del) => {
        if (del.id === orderId) {
          return { ...del, status: newStatus };
        }
        return del;
      })
    );
    try {
      await fetch(`${API_ENDPOINTS.orders}/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, vendorId: userPhone }),
      });
    } catch {}
    triggerRefresh();
    showToast(
      `Order #${(orderId || '').toUpperCase()} marked as ${newStatus}!`
    );
  };

  // Accept Order
  const handleAcceptOrder = async (orderId: string, prepTime: string) => {
    setDeliveriesList((prev) =>
      prev.map((d) =>
        d.id === orderId
          ? { ...d, status: 'Accepted', estimatedPrepMinutes: prepTime }
          : d
      )
    );
    try {
      await fetch(`${API_ENDPOINTS.orders}/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Accepted',
          deliveryStatus: 'ACCEPTED',
          estimatedPrepMinutes: prepTime,
          vendorId: userPhone,
        }),
      });
    } catch {}
    setAcceptModalOrder(null);
    showToast(
      `Order #${orderId.toUpperCase()} Accepted! Prep time: ${prepTime} mins.`
    );
  };

  // Reject Order
  const handleRejectOrder = async (orderId: string, reason: string) => {
    setDeliveriesList((prev) =>
      prev.map((d) =>
        d.id === orderId
          ? { ...d, status: 'Rejected', rejectionReason: reason }
          : d
      )
    );
    try {
      await fetch(`${API_ENDPOINTS.orders}/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Rejected',
          deliveryStatus: 'CANCELLED',
          rejectionReason: reason,
          vendorId: userPhone,
        }),
      });
    } catch {}
    setRejectModalOrder(null);
    showToast(`Order #${orderId.toUpperCase()} Rejected (${reason})`);
  };


  return (
    <View className="flex-1 bg-slate-50">
      {/* ── Top Producer Bar with Vendor Identity ── */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <View className="bg-emerald-100 px-2 py-0.5 rounded self-start mb-1 flex-row items-center gap-1">
          <Sprout size={12} color={VC.accent} />
          <Text className="text-2xs font-extrabold text-emerald-700 tracking-wider">
            {userPhone
              ? `APPROVED VENDOR · +91 ${userPhone}`
              : 'JEENA FARMING HUB'}
          </Text>
        </View>
        <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
          {vendorProfile?.farmName || 'Jeena Farming'}
        </Text>
        <Text className="text-xs text-slate-500">
          {vendorProfile?.farmLocation
            ? `${vendorProfile.farmLocation} · Verified Producer`
            : 'Dharmapuri, Tamil Nadu · Verified Producer'}
        </Text>
      </View>

      {/* ── Smooth Non-Disruptive Inline Notification Toast ── */}
      {toastMessage && (
        <View className="flex-row items-center bg-emerald-50 border border-emerald-300 px-3.5 py-2.5 mx-3.5 mt-2.5 rounded-xl gap-2">
          <CircleCheck size={16} color="#047857" strokeWidth={2.5} />
          <Text
            className="text-xs font-semibold text-emerald-900 flex-1"
            numberOfLines={1}
          >
            {toastMessage}
          </Text>
        </View>
      )}

      {/* Tab Screen Contents */}
      {activeTab === 'dashboard' && (
        <VendorDashboardScreen
          userPhone={userPhone}
          vendorProfile={vendorProfile}
          productList={productList}
          deliveriesList={deliveriesList}
          harvests={harvests}
          onNavigateTab={setActiveTab}
          onOpenAddCrop={() => setModalOpen(true)}
          onOpenDeliverySettings={() => setShowDeliverySettings(true)}
        />
      )}

      {activeTab === 'crops' && (
        <VendorCropsScreen
          productList={productList}
          onOpenAddModal={() => setModalOpen(true)}
          onRequestDeleteCrop={handleRequestDeleteCrop}
          onStockAdjust={handleStockAdjust}
          onToggleStockStatus={handleToggleStockStatus}
        />
      )}

      {activeTab === 'orders' && (
        <VendorOrdersScreen
          deliveriesList={deliveriesList}
          onOpenAcceptModal={setAcceptModalOrder}
          onOpenRejectModal={setRejectModalOrder}
          onOpenOtpModal={setDelivOtpModalOrder}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

      {activeTab === 'harvests' && (
        <VendorHarvestScreen harvests={harvests} />
      )}

      {activeTab === 'payouts' && <VendorPayoutsScreen />}

      {/* ── Modals ── */}
      <AddCropModal
        visible={isAddModalOpen}
        onClose={() => setModalOpen(false)}
        userPhone={userPhone}
        vendorId={vendorProfile?.id}
        onSuccess={(newCrop) => {
          setProductList((prev) => [newCrop, ...prev]);
          triggerRefresh();
          setModalOpen(false);
          setActiveTab('crops');
          showToast(`"${newCrop.name}" saved to Prisma DB & active in catalog!`);
        }}
        showToast={showToast}
      />

      <AdminPinModal
        modalData={adminAuthModal}
        onClose={() => setAdminAuthModal(null)}
        onDeleteSuccess={(cropId, cropName) => {
          setProductList((prev) => prev.filter((p) => p.id !== cropId));
          triggerRefresh();
          showToast(`Admin Authorized: "${cropName}" deleted from catalog`);
        }}
      />

      <DeliverySettingsModal
        visible={showDeliverySettings}
        onClose={() => setShowDeliverySettings(false)}
        showToast={showToast}
      />

      <AcceptOrderModal
        order={acceptModalOrder}
        onClose={() => setAcceptModalOrder(null)}
        onConfirm={handleAcceptOrder}
      />

      <RejectOrderModal
        order={rejectModalOrder}
        onClose={() => setRejectModalOrder(null)}
        onConfirm={handleRejectOrder}
      />

      <DeliveryOtpModal
        order={delivOtpModalOrder}
        onClose={() => setDelivOtpModalOrder(null)}
        onSuccess={(orderId) => {
          setDeliveriesList((prev) =>
            prev.map((d) =>
              d.id === orderId
                ? {
                    ...d,
                    status: 'Delivered',
                    deliveredAt: new Date().toISOString(),
                  }
                : d
            )
          );
          setDelivOtpModalOrder(null);
          triggerRefresh();
        }}
        showToast={showToast}
      />
    </View>
  );
};

// Aliased export for compatibility with legacy callers
export const VendorScreens = VendorPortalScreen;
export default VendorPortalScreen;
