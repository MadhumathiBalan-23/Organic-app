import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, TextInput, Modal, SafeAreaView
} from 'react-native';
import { Product, MockProducts, MockOrders, MockSubscriptions } from '../constants/mockData';

// ── Colour Palette ───────────────────────────────────────
const C = {
  primary: '#0D2B1D', light: '#2D6A4F', accent: '#D4AC0D',
  bg: '#F0F4F1', surface: '#FFFFFF', surface2: '#F7FAF8',
  border: '#E2EBE6', textPrimary: '#1a1a2e', textSec: '#5a6a63',
  textMuted: '#9aada6', success: '#22c55e', warning: '#f59e0b',
  danger: '#ef4444', info: '#3b82f6',
};

interface CustomerScreensProps {
  customerScreen: string;
  setCustomerScreen: (screen: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProduct: Product;
  setSelectedProduct: (p: Product) => void;
  activeSubscriptionData: any;
  setActiveSubscriptionData: (d: any) => void;
  subscriptions: any[];
  setSubscriptions: React.Dispatch<React.SetStateAction<any[]>>;
  handleLogout: () => void;
}

// ── Shared mini components ────────────────────────────────
const BackBtn: React.FC<{ onPress: () => void; label?: string }> = ({ onPress, label = '← Back' }) => (
  <TouchableOpacity onPress={onPress} style={cs.backBtn}>
    <Text style={cs.backBtnText}>{label}</Text>
  </TouchableOpacity>
);

const SectionTitle: React.FC<{ children: string; action?: { label: string; onPress: () => void } }> = ({ children, action }) => (
  <View style={cs.sectionTitleRow}>
    <Text style={cs.sectionTitle}>{children}</Text>
    {action && <TouchableOpacity onPress={action.onPress}><Text style={cs.seeAll}>{action.label}</Text></TouchableOpacity>}
  </View>
);

export const CustomerScreens: React.FC<CustomerScreensProps> = ({
  customerScreen, setCustomerScreen,
  searchQuery, setSearchQuery,
  selectedProduct, setSelectedProduct,
  activeSubscriptionData, setActiveSubscriptionData,
  subscriptions, setSubscriptions,
  handleLogout,
}) => {

  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  // Screen specific top-level state hooks (Rules of Hooks compliant)
  const [detailQty, setDetailQty] = useState(1);
  const [subQty, setSubQty] = useState(1);
  const [subFreq, setSubFreq] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [subTime, setSubTime] = useState('06:30 AM');
  const [subDuration, setSubDuration] = useState(30);
  const [gateway, setGateway] = useState('UPI');
  const [subTab, setSubTab] = useState<'Active' | 'History'>('Active');

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (p: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (existing) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product: p, qty }];
    });
    Alert.alert('Added to Cart', `${p.name} added! 🛒`);
  };

  const updateCartQty = (p: Product, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (!existing) {
        if (delta > 0) return [...prev, { product: p, qty: 1 }];
        return prev;
      }
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.product.id !== p.id);
      return prev.map(i => i.product.id === p.id ? { ...i, qty: newQty } : i);
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const categories = ['All', 'Dairy & Pure Ghee', 'Fresh Vegetables', 'Fresh Fruits', 'Groceries & Grains', 'Organic Oils', 'Dry Fruits & Snacks'];
  const categoryEmoji: Record<string, string> = {
    'All': '🌿', 'Dairy & Pure Ghee': '🥛', 'Fresh Vegetables': '🥦',
    'Fresh Fruits': '🍎', 'Groceries & Grains': '🌾', 'Organic Oils': '🫒', 'Dry Fruits & Snacks': '🍯'
  };

  const filteredProducts = MockProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  // Render Product Card with proper interactive buttons
  const renderProductCard = (p: Product) => {
    const cartItem = cart.find(i => i.product.id === p.id);
    const qty = cartItem ? cartItem.qty : 0;

    return (
      <TouchableOpacity key={p.id} style={cs.productCard} onPress={() => { setSelectedProduct(p); setCustomerScreen('PRODUCT_DETAILS'); }} activeOpacity={0.88}>
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: p.imageUrl }} style={cs.productImg} />
          {p.organicCertified && (
            <View style={cs.certBadge}><Text style={cs.certBadgeText}>✓ Certified Organic</Text></View>
          )}
          {p.stock <= p.minStock && (
            <View style={cs.lowBadge}><Text style={cs.lowBadgeText}>Low Stock</Text></View>
          )}
        </View>

        <View style={cs.productCardBody}>
          <Text style={cs.productName} numberOfLines={1}>{p.name}</Text>
          <Text style={cs.productCat} numberOfLines={1}>{p.category}</Text>
          
          <Text style={cs.deliveryBadge}>⚡ Delivery by 6:30 AM Tomorrow</Text>

          <View style={cs.priceRow}>
            <Text style={cs.productPrice}>₹{p.price}<Text style={cs.productUnit}>/{p.unit}</Text></Text>
            <Text style={cs.productRating}>★ {p.rating}</Text>
          </View>

          {/* Interactive Button Section */}
          <View style={cs.cardActionRow}>
            {qty > 0 ? (
              <View style={cs.qtySelectorBox}>
                <TouchableOpacity style={cs.qtySelectorBtn} onPress={() => updateCartQty(p, -1)}>
                  <Text style={cs.qtySelectorBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={cs.qtySelectorVal}>{qty}</Text>
                <TouchableOpacity style={cs.qtySelectorBtn} onPress={() => updateCartQty(p, 1)}>
                  <Text style={cs.qtySelectorBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={cs.addCartBtn} onPress={() => addToCart(p)}>
                <Text style={cs.addCartBtnText}>+ Add to Cart</Text>
              </TouchableOpacity>
            )}

            {p.subscriptionAllowed && (
              <TouchableOpacity
                style={cs.quickSubBtn}
                onPress={() => {
                  setSelectedProduct(p);
                  setCustomerScreen('PRODUCT_DETAILS');
                }}
              >
                <Text style={cs.quickSubBtnText}>🔄 Subscribe</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Floating Cart Bar component when items are in cart
  const FloatingCartBar = () => {
    if (cartCount === 0 || customerScreen === 'CART' || customerScreen === 'CHECKOUT') return null;
    return (
      <View style={cs.floatingCartBar}>
        <View style={{ flex: 1 }}>
          <Text style={cs.floatingCartTitle}>{cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Cart</Text>
          <Text style={cs.floatingCartPrice}>₹{cartTotal} <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '400' }}>+ Free Delivery</Text></Text>
        </View>
        <TouchableOpacity style={cs.floatingCartBtn} onPress={() => setCustomerScreen('CART')}>
          <Text style={cs.floatingCartBtnText}>View Cart →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── HOME SCREEN ─────────────────────────────────────────
  if (customerScreen === 'HOME') return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={cs.scroll}>
        {/* Hero Banner */}
        <View style={cs.heroBanner}>
          <View style={{ flex: 1 }}>
            <View style={cs.heroBadge}><Text style={cs.heroBadgeText}>🌟 DAILY FRESH HARVEST</Text></View>
            <Text style={cs.heroTitle}>Farm-to-Door{'\n'}Organic Goodness</Text>
            <Text style={cs.heroSub}>Pure certified organic milk, veggies & ghee.</Text>
            <TouchableOpacity style={cs.heroBtn} onPress={() => setCustomerScreen('ALL_PRODUCTS')}>
              <Text style={cs.heroBtnText}>Shop Now →</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 56 }}>🌾</Text>
        </View>

        {/* Search */}
        <View style={cs.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={cs.searchInput} placeholder="Search milk, ghee, fruits…"
            value={searchQuery} onChangeText={setSearchQuery}
            placeholderTextColor={C.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}><Text style={{ color: C.textMuted, fontSize: 16 }}>✕</Text></TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <SectionTitle>Browse Categories</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[cs.catChip, activeCategory === cat && cs.catChipActive]}
              onPress={() => { setActiveCategory(cat); setCustomerScreen('ALL_PRODUCTS'); }}
            >
              <Text style={{ fontSize: 13 }}>{categoryEmoji[cat]}</Text>
              <Text style={[cs.catChipText, activeCategory === cat && cs.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured products */}
        <SectionTitle action={{ label: 'See All →', onPress: () => setCustomerScreen('ALL_PRODUCTS') }}>
          Today's Fresh Picks
        </SectionTitle>
        <View style={cs.productGrid}>
          {MockProducts.slice(0, 4).map(p => renderProductCard(p))}
        </View>

        {/* Offers Banner */}
        <View style={cs.offerBanner}>
          <Text style={cs.offerTitle}>🎁 Subscribe Daily & Save 10% Extra</Text>
          <Text style={cs.offerSub}>Set up daily A2 Milk or Fresh Vegetable deliveries & get 10% cashback on advance monthly passes.</Text>
          <TouchableOpacity style={cs.offerBtn} onPress={() => setCustomerScreen('ALL_PRODUCTS')}>
            <Text style={cs.offerBtnText}>Explore Subscription Plans →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick links */}
        <SectionTitle>My Account & Shortcuts</SectionTitle>
        <View style={cs.quickLinks}>
          {[
            { icon: '📦', label: 'My Orders', screen: 'ORDER_HISTORY' },
            { icon: '🔄', label: 'Subscriptions', screen: 'MY_SUBSCRIPTIONS' },
            { icon: '🛒', label: `Cart (${cartCount})`, screen: 'CART' },
            { icon: '💬', label: 'WhatsApp AI', screen: 'WHATSAPP_AI' },
          ].map(item => (
            <TouchableOpacity key={item.screen} style={cs.quickLinkCard} onPress={() => setCustomerScreen(item.screen)}>
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              <Text style={cs.quickLinkLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
      <FloatingCartBar />
    </View>
  );

  // ── ALL PRODUCTS ─────────────────────────────────────────
  if (customerScreen === 'ALL_PRODUCTS') return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={cs.scroll}>
        <BackBtn onPress={() => setCustomerScreen('HOME')} label="← Home" />

        {/* Search */}
        <View style={cs.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput style={cs.searchInput} placeholder="Search products…" value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={C.textMuted} />
        </View>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} style={[cs.catChip, activeCategory === cat && cs.catChipActive]} onPress={() => setActiveCategory(cat)}>
              <Text style={{ fontSize: 12 }}>{categoryEmoji[cat]}</Text>
              <Text style={[cs.catChipText, activeCategory === cat && cs.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[cs.sectionTitle, { marginBottom: 12 }]}>
          {filteredProducts.length} organic products {activeCategory !== 'All' ? `in ${activeCategory}` : ''}
        </Text>
      </View>

      <ScrollView contentContainerStyle={[cs.scroll, { paddingTop: 0 }]} showsVerticalScrollIndicator={false}>
        <View style={cs.productGrid}>
          {filteredProducts.map(p => renderProductCard(p))}
          {filteredProducts.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center', width: '100%' }}>
              <Text style={{ fontSize: 40 }}>🌱</Text>
              <Text style={{ color: C.textMuted, marginTop: 10, fontSize: 13 }}>No products found</Text>
            </View>
          )}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
      <FloatingCartBar />
    </View>
  );

  // ── PRODUCT DETAILS ───────────────────────────────────────
  if (customerScreen === 'PRODUCT_DETAILS') {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ position: 'relative' }}>
            <Image source={{ uri: selectedProduct.imageUrl }} style={cs.detailHeroImg} />
            <TouchableOpacity 
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: 'rgba(13, 43, 29, 0.85)',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4
              }}
              onPress={() => setCustomerScreen('HOME')}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>← Back to Products</Text>
            </TouchableOpacity>
          </View>
          <View style={cs.detailCard}>
            {selectedProduct.organicCertified && (
              <View style={cs.certBadgeInline}><Text style={cs.certBadgeText}>✓ 100% Organic Certified</Text></View>
            )}
            <Text style={cs.detailName}>{selectedProduct.name}</Text>
            <Text style={cs.detailCat}>{selectedProduct.category}</Text>
            <Text style={cs.detailPrice}>₹{selectedProduct.price} <Text style={cs.detailUnit}>/{selectedProduct.unit}</Text></Text>
            <Text style={cs.detailRating}>★ {selectedProduct.rating} · Available {selectedProduct.availabilityStart}–{selectedProduct.availabilityEnd}</Text>

            <View style={cs.divider} />

            <Text style={cs.detailSection}>Description</Text>
            <Text style={cs.detailDesc}>{selectedProduct.description}</Text>

            <Text style={cs.detailSection}>Key Benefits</Text>
            {selectedProduct.benefits.map((b: string, i: number) => (
              <View key={i} style={cs.benefitRow}>
                <Text style={{ fontSize: 14, marginRight: 8 }}>🌱</Text>
                <Text style={cs.benefitText}>{b}</Text>
              </View>
            ))}

            {/* Quantity */}
            <View style={cs.divider} />
            <View style={cs.qtyRow}>
              <Text style={cs.detailSection}>Quantity</Text>
              <View style={cs.qtyControl}>
                <TouchableOpacity style={cs.qtyBtn} onPress={() => setDetailQty(Math.max(1, detailQty - 1))}><Text style={cs.qtyBtnText}>−</Text></TouchableOpacity>
                <Text style={cs.qtyVal}>{detailQty} {selectedProduct.unit}</Text>
                <TouchableOpacity style={cs.qtyBtn} onPress={() => setDetailQty(detailQty + 1)}><Text style={cs.qtyBtnText}>+</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom action bar */}
        <View style={cs.bottomBar}>
          <View>
            <Text style={cs.bottomBarLabel}>TOTAL</Text>
            <Text style={cs.bottomBarTotal}>₹{selectedProduct.price * detailQty}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {selectedProduct.oneTimeAllowed && (
              <TouchableOpacity style={cs.buyOnceBtn} onPress={() => { addToCart(selectedProduct, detailQty); setCustomerScreen('HOME'); }}>
                <Text style={cs.buyOnceBtnText}>🛒 Add to Cart</Text>
              </TouchableOpacity>
            )}
            {selectedProduct.subscriptionAllowed && (
              <TouchableOpacity style={cs.subscribeBtn} onPress={() => {
                setActiveSubscriptionData({ product: selectedProduct, qty: detailQty, freq: 'Daily', duration: 30, time: '06:30 AM', priceTotal: selectedProduct.price * detailQty * 30 });
                setCustomerScreen('SUBSCRIPTION_CREATE');
              }}>
                <Text style={cs.subscribeBtnText}>🔄 Subscribe</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ── CART ──────────────────────────────────────────────────
  if (customerScreen === 'CART') return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
        <BackBtn onPress={() => setCustomerScreen('HOME')} />
        <Text style={cs.screenTitle}>🛒 My Cart</Text>
        {cart.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 50 }}>
            <Text style={{ fontSize: 50 }}>🛒</Text>
            <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 14 }}>Your cart is empty</Text>
            <TouchableOpacity style={[cs.buyOnceBtn, { marginTop: 16 }]} onPress={() => setCustomerScreen('ALL_PRODUCTS')}>
              <Text style={cs.buyOnceBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cart.map(item => (
              <View key={item.product.id} style={cs.cartItem}>
                <Image source={{ uri: item.product.imageUrl }} style={cs.cartThumb} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={cs.cartItemName} numberOfLines={1}>{item.product.name}</Text>
                  <Text style={cs.cartItemCat}>{item.product.category}</Text>
                  <Text style={cs.cartItemPrice}>₹{item.product.price} × {item.qty} = <Text style={{ color: C.light, fontWeight: '800' }}>₹{item.product.price * item.qty}</Text></Text>
                </View>
                <TouchableOpacity style={cs.removeBtn} onPress={() => removeFromCart(item.product.id)}>
                  <Text style={{ color: C.danger, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={cs.cartSummary}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.textSec, fontSize: 13 }}>Subtotal ({cartCount} items)</Text>
                <Text style={{ fontWeight: '700', fontSize: 13 }}>₹{cartTotal}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.textSec, fontSize: 13 }}>Delivery</Text>
                <Text style={{ fontWeight: '700', fontSize: 13, color: C.success }}>FREE</Text>
              </View>
              <View style={cs.divider} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 16 }}>Total</Text>
                <Text style={{ color: C.primary, fontWeight: '800', fontSize: 18 }}>₹{cartTotal}</Text>
              </View>
            </View>
            <TouchableOpacity style={cs.checkoutBtn} onPress={() => {
              Alert.alert('Order Placed! 🎉', `Your order of ₹${cartTotal} has been placed successfully. Estimated delivery: 06:00–09:00 AM tomorrow.`);
              setCart([]);
              setCustomerScreen('HOME');
            }}>
              <Text style={cs.checkoutBtnText}>Place Order · ₹{cartTotal}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );

  // ── SUBSCRIPTION CREATE ───────────────────────────────────
  if (customerScreen === 'SUBSCRIPTION_CREATE') {
    const total = subQty * activeSubscriptionData.product.price * (subFreq === 'Daily' ? subDuration : subFreq === 'Weekly' ? Math.ceil(subDuration / 7) : 1);
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
          <BackBtn onPress={() => setCustomerScreen('PRODUCT_DETAILS')} />
          <Text style={cs.screenTitle}>Configure Subscription</Text>
          <Text style={cs.screenSub}>Set up automated deliveries for {activeSubscriptionData.product.name}</Text>

          {[
            { title: 'Daily Quantity', body: (
              <View style={cs.qtyControl}>
                <TouchableOpacity style={cs.qtyBtn} onPress={() => setSubQty(Math.max(1, subQty - 1))}><Text style={cs.qtyBtnText}>−</Text></TouchableOpacity>
                <Text style={cs.qtyVal}>{subQty} {activeSubscriptionData.product.unit}</Text>
                <TouchableOpacity style={cs.qtyBtn} onPress={() => setSubQty(subQty + 1)}><Text style={cs.qtyBtnText}>+</Text></TouchableOpacity>
              </View>
            )},
            { title: 'Delivery Frequency', body: (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['Daily', 'Weekly', 'Monthly'] as const).map(f => (
                  <TouchableOpacity key={f} style={[cs.freqPill, subFreq === f && cs.freqPillActive]} onPress={() => setSubFreq(f)}>
                    <Text style={[cs.freqPillText, subFreq === f && cs.freqPillTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )},
            { title: 'Morning Delivery Slot', body: (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['06:00 AM', '07:00 AM', '08:00 AM'].map(t => (
                  <TouchableOpacity key={t} style={[cs.freqPill, subTime === t && cs.freqPillActive]} onPress={() => setSubTime(t)}>
                    <Text style={[cs.freqPillText, subTime === t && cs.freqPillTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )},
            { title: 'Plan Duration', body: (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[15, 30, 90].map(d => (
                  <TouchableOpacity key={d} style={[cs.freqPill, subDuration === d && cs.freqPillActive]} onPress={() => setSubDuration(d)}>
                    <Text style={[cs.freqPillText, subDuration === d && cs.freqPillTextActive]}>{d} Days</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )},
          ].map((block, i) => (
            <View key={i} style={cs.configCard}>
              <Text style={cs.configCardTitle}>{block.title}</Text>
              <View style={{ marginTop: 10 }}>{block.body}</View>
            </View>
          ))}
        </ScrollView>
        <View style={cs.bottomBar}>
          <View>
            <Text style={cs.bottomBarLabel}>ESTIMATED TOTAL</Text>
            <Text style={cs.bottomBarTotal}>₹{total}</Text>
          </View>
          <TouchableOpacity style={cs.subscribeBtn} onPress={() => {
            setActiveSubscriptionData({ ...activeSubscriptionData, qty: subQty, freq: subFreq, time: subTime, duration: subDuration, priceTotal: total });
            setCustomerScreen('SUBSCRIPTION_SUMMARY');
          }}>
            <Text style={cs.subscribeBtnText}>Review Plan →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── SUBSCRIPTION SUMMARY ──────────────────────────────────
  if (customerScreen === 'SUBSCRIPTION_SUMMARY') return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
        <BackBtn onPress={() => setCustomerScreen('SUBSCRIPTION_CREATE')} />
        <Text style={cs.screenTitle}>Plan Summary</Text>
        <View style={cs.configCard}>
          <Text style={cs.configCardTitle}>Order Details</Text>
          {[
            { lbl: 'Product', val: activeSubscriptionData.product.name },
            { lbl: 'Qty / Drop', val: `${activeSubscriptionData.qty} ${activeSubscriptionData.product.unit}` },
            { lbl: 'Frequency', val: activeSubscriptionData.freq },
            { lbl: 'Delivery Slot', val: activeSubscriptionData.time },
            { lbl: 'Duration', val: `${activeSubscriptionData.duration} Days` },
            { lbl: 'Total Amount', val: `₹${activeSubscriptionData.priceTotal}` },
          ].map(row => (
            <View key={row.lbl} style={cs.summaryRow}>
              <Text style={cs.summaryLabel}>{row.lbl}</Text>
              <Text style={cs.summaryVal}>{row.val}</Text>
            </View>
          ))}
        </View>
        <View style={cs.configCard}>
          <Text style={[cs.configCardTitle, { color: C.success }]}>✓ Free Benefits Included</Text>
          {['Free morning doorstep delivery', 'WhatsApp delivery alerts', 'Skip or pause anytime'].map(b => (
            <View key={b} style={cs.benefitRow}><Text style={{ fontSize: 14, marginRight: 8 }}>🌱</Text><Text style={cs.benefitText}>{b}</Text></View>
          ))}
        </View>
      </ScrollView>
      <View style={cs.bottomBar}>
        <Text style={{ fontSize: 12, color: C.textSec }}>Advance payment required</Text>
        <TouchableOpacity style={cs.checkoutBtn} onPress={() => setCustomerScreen('PAYMENT')}>
          <Text style={cs.checkoutBtnText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── PAYMENT ───────────────────────────────────────────────
  if (customerScreen === 'PAYMENT') {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
          <BackBtn onPress={() => setCustomerScreen('SUBSCRIPTION_SUMMARY')} />
          <Text style={cs.screenTitle}>Secure Checkout</Text>
          <View style={cs.payBanner}>
            <Text style={cs.payBannerLabel}>AMOUNT TO PAY</Text>
            <Text style={cs.payBannerAmt}>₹{activeSubscriptionData.priceTotal}</Text>
            <Text style={cs.payBannerSub}>🔒 Secured via Razorpay</Text>
          </View>
          <Text style={cs.detailSection}>Select Payment Method</Text>
          {[
            { id: 'UPI', name: 'UPI (GPay / PhonePe)', desc: 'Fastest · Zero fee', icon: '📱' },
            { id: 'CARD', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
            { id: 'BANKING', name: 'Net Banking', desc: 'All major banks', icon: '🏛️' },
            { id: 'WALLET', name: 'Paytm / Wallet', desc: 'Quick cashback', icon: '💼' },
          ].map(g => (
            <TouchableOpacity key={g.id} style={[cs.payRow, gateway === g.id && cs.payRowActive]} onPress={() => setGateway(g.id)}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[cs.payRowName, gateway === g.id && { color: C.primary }]}>{g.name}</Text>
                <Text style={cs.payRowDesc}>{g.desc}</Text>
              </View>
              <View style={[cs.radioBtn, gateway === g.id && cs.radioBtnActive]}>
                {gateway === g.id && <View style={cs.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={cs.bottomBar}>
          <TouchableOpacity style={cs.checkoutBtn} onPress={() => {
            const newSub = { id: 'sub_' + Date.now(), product: activeSubscriptionData.product, qty: activeSubscriptionData.qty, freq: activeSubscriptionData.freq, duration: activeSubscriptionData.duration, time: activeSubscriptionData.time, priceTotal: activeSubscriptionData.priceTotal, status: 'Active', startDate: new Date().toISOString().split('T')[0], skippedDates: [] };
            setSubscriptions((prev: any[]) => [newSub, ...prev]);
            Alert.alert('🎉 Payment Successful!', `₹${activeSubscriptionData.priceTotal} paid via ${gateway}. Subscription is now active!`);
            setCustomerScreen('MY_SUBSCRIPTIONS');
          }}>
            <Text style={cs.checkoutBtnText}>Pay ₹{activeSubscriptionData.priceTotal} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── MY SUBSCRIPTIONS ─────────────────────────────────────
  if (customerScreen === 'MY_SUBSCRIPTIONS') {
    const handlePause = (id: string) => setSubscriptions((prev: any[]) => prev.map((s: any) => s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s));
    const handleSkip = (id: string) => {
      const today = new Date().toISOString().split('T')[0];
      setSubscriptions((prev: any[]) => prev.map((s: any) => {
        if (s.id !== id) return s;
        const skipped = s.skippedDates || [];
        return { ...s, skippedDates: skipped.includes(today) ? skipped.filter((d: string) => d !== today) : [...skipped, today] };
      }));
    };
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={cs.tabStrip}>
          {(['Active', 'History'] as const).map(t => (
            <TouchableOpacity key={t} style={[cs.tabStripBtn, subTab === t && cs.tabStripBtnActive]} onPress={() => setSubTab(t)}>
              <Text style={[cs.tabStripText, subTab === t && cs.tabStripTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
          {subTab === 'Active' && subscriptions.map((sub: any) => {
            const today = new Date().toISOString().split('T')[0];
            const skippedToday = (sub.skippedDates || []).includes(today);
            return (
              <View key={sub.id} style={cs.subCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={cs.subCardName}>{sub.product.name}</Text>
                    <Text style={cs.subCardInfo}>🕐 {sub.time} · {sub.qty} {sub.product.unit} · {sub.freq}</Text>
                    <Text style={cs.subCardInfo}>📅 Started {sub.startDate}</Text>
                  </View>
                  <View style={[cs.statusPill, { backgroundColor: sub.status === 'Active' ? '#DCFCE7' : '#FEF3C7' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: sub.status === 'Active' ? C.success : C.warning }}>{sub.status}</Text>
                  </View>
                </View>
                <View style={cs.divider} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[cs.subActionBtn, { borderColor: C.warning }]} onPress={() => handleSkip(sub.id)}>
                    <Text style={{ color: C.warning, fontSize: 11, fontWeight: '700' }}>{skippedToday ? '↩ Resume' : '⏭ Skip Today'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[cs.subActionBtn, { borderColor: C.info }]} onPress={() => handlePause(sub.id)}>
                    <Text style={{ color: C.info, fontSize: 11, fontWeight: '700' }}>{sub.status === 'Paused' ? '▶ Resume' : '⏸ Pause'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[cs.subActionBtn, { borderColor: C.danger }]} onPress={() => {
                    Alert.alert('Cancel Subscription', 'Are you sure?', [{ text: 'No', style: 'cancel' }, { text: 'Yes, Cancel', style: 'destructive', onPress: () => setSubscriptions((prev: any[]) => prev.filter((s: any) => s.id !== sub.id)) }]);
                  }}>
                    <Text style={{ color: C.danger, fontSize: 11, fontWeight: '700' }}>✕ Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          {(subTab === 'History' || subscriptions.length === 0) && (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 10 }}>
                {subTab === 'History' ? 'No past subscriptions' : 'No active subscriptions'}
              </Text>
              <TouchableOpacity style={[cs.subscribeBtn, { marginTop: 16 }]} onPress={() => setCustomerScreen('ALL_PRODUCTS')}>
                <Text style={cs.subscribeBtnText}>Browse & Subscribe</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── ORDER HISTORY ─────────────────────────────────────────
  if (customerScreen === 'ORDER_HISTORY') return (
    <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
      <BackBtn onPress={() => setCustomerScreen('HOME')} />
      <Text style={cs.screenTitle}>📦 My Orders</Text>
      {MockOrders.map(order => (
        <View key={order.id} style={cs.orderCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={cs.orderIdText}>{order.id}</Text>
              <Text style={cs.orderProductText} numberOfLines={2}>{order.products}</Text>
              <Text style={cs.orderMetaText}>📅 {order.date} · 💳 {order.paymentStatus}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={cs.orderAmount}>₹{order.amount}</Text>
              <View style={[cs.statusPill, { backgroundColor: order.deliveryStatus === 'DELIVERED' ? '#DCFCE7' : '#DBEAFE' }]}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: order.deliveryStatus === 'DELIVERED' ? C.success : C.info }}>{order.deliveryStatus}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  // ── PROFILE ───────────────────────────────────────────────
  if (customerScreen === 'PROFILE') return (
    <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
      <BackBtn onPress={() => setCustomerScreen('HOME')} />
      {/* Profile Card */}
      <View style={cs.profileCard}>
        <View style={cs.profileAvatar}><Text style={{ fontSize: 32 }}>👩🏽</Text></View>
        <Text style={cs.profileName}>Ananya Sharma</Text>
        <Text style={cs.profilePhone}>📞 +91 98765 43210</Text>
        <View style={cs.profileBadge}><Text style={{ fontSize: 10, color: C.accent, fontWeight: '700' }}>🌿 ORGANIC MEMBER</Text></View>
      </View>

      {/* Stats */}
      <View style={cs.profileStats}>
        {[{ val: MockOrders.length, lbl: 'Orders' }, { val: subscriptions.length, lbl: 'Active Plans' }, { val: '₹' + MockOrders.reduce((s, o) => s + o.amount, 0), lbl: 'Total Spent' }].map(stat => (
          <View key={stat.lbl} style={cs.profileStatBox}>
            <Text style={[cs.subCardName, { color: C.primary }]}>{stat.val}</Text>
            <Text style={cs.subCardInfo}>{stat.lbl}</Text>
          </View>
        ))}
      </View>

      {/* Menu items */}
      {[
        { icon: '📦', label: 'My Orders', screen: 'ORDER_HISTORY' },
        { icon: '🔄', label: 'My Subscriptions', screen: 'MY_SUBSCRIPTIONS' },
        { icon: '🛒', label: 'Cart', screen: 'CART' },
        { icon: '📍', label: 'Delivery Addresses', screen: 'HOME' },
        { icon: '🎁', label: 'Offers & Cashback', screen: 'HOME' },
        { icon: '💬', label: 'WhatsApp AI Support', screen: 'WHATSAPP_AI' },
        { icon: '📞', label: 'Voice AI Assistant', screen: 'AI_VOICE_CALL' },
      ].map(item => (
        <TouchableOpacity key={item.label} style={cs.profileMenuItem} onPress={() => setCustomerScreen(item.screen)}>
          <Text style={{ fontSize: 18, marginRight: 12 }}>{item.icon}</Text>
          <Text style={cs.profileMenuText}>{item.label}</Text>
          <Text style={{ color: C.textMuted, marginLeft: 'auto' }}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={cs.logoutBtn} onPress={handleLogout}>
        <Text style={{ color: C.danger, fontWeight: '700', fontSize: 14 }}>🔒 Sign Out</Text>
      </TouchableOpacity>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  return null;
};

// ── Styles ────────────────────────────────────────────────
const cs = StyleSheet.create({
  scroll: { padding: 16, backgroundColor: C.bg },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtnText: { fontSize: 13, fontWeight: '600', color: C.light },

  // Hero
  heroBanner: { backgroundColor: C.primary, borderRadius: 18, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  heroBadge: { backgroundColor: C.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 8 },
  heroBadgeText: { fontSize: 9, fontWeight: '800', color: C.primary },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 26 },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  heroBtn: { backgroundColor: C.accent, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginTop: 12, alignSelf: 'flex-start' },
  heroBtnText: { fontSize: 12, fontWeight: '700', color: C.primary },

  // Search
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 13, color: C.textPrimary },

  // Section
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  seeAll: { fontSize: 12, fontWeight: '600', color: C.light },

  // Categories
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.surface, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, borderWidth: 1, borderColor: C.border },
  catChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  catChipText: { fontSize: 11, fontWeight: '600', color: C.textSec },
  catChipTextActive: { color: '#fff' },

  // Product cards
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: C.surface, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  productImg: { width: '100%', height: 110, backgroundColor: C.border },
  certBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#86EFAC' },
  certBadgeText: { color: '#15803D', fontSize: 8, fontWeight: '700' },
  certBadgeInline: { backgroundColor: '#DCFCE7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  lowBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(239,68,68,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  lowBadgeText: { color: '#fff', fontSize: 8, fontWeight: '700' },
  productCardBody: { padding: 10 },
  productName: { fontSize: 12, fontWeight: '700', color: C.textPrimary },
  productCat: { fontSize: 9, color: C.textMuted, marginTop: 2 },
  deliveryBadge: { fontSize: 8.5, fontWeight: '700', color: '#15803D', backgroundColor: '#F0FDF4', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  productPrice: { fontSize: 13, fontWeight: '800', color: C.primary },
  productUnit: { fontSize: 10, color: C.textSec, fontWeight: '400' },
  productRating: { fontSize: 10, color: C.warning, fontWeight: '600' },

  cardActionRow: { gap: 6, marginTop: 8 },
  addCartBtn: { backgroundColor: '#15803D', borderRadius: 8, paddingVertical: 6, alignItems: 'center', shadowColor: '#15803D', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 1 },
  addCartBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  qtySelectorBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', borderRadius: 8, borderWidth: 1, borderColor: '#86EFAC', paddingHorizontal: 4, paddingVertical: 2 },
  qtySelectorBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#15803D', alignItems: 'center', justifyContent: 'center' },
  qtySelectorBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800', lineHeight: 16 },
  qtySelectorVal: { fontSize: 12, fontWeight: '800', color: '#15803D' },

  quickSubBtn: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingVertical: 4, alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B' },
  quickSubBtnText: { color: '#B45309', fontSize: 9.5, fontWeight: '800' },

  // Floating Cart Bar
  floatingCartBar: { position: 'absolute', bottom: 12, left: 16, right: 16, backgroundColor: '#0D2B1D', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8, borderWidth: 1, borderColor: '#22c55e' },
  floatingCartTitle: { color: '#86EFAC', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  floatingCartPrice: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  floatingCartBtn: { backgroundColor: '#22c55e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  floatingCartBtnText: { color: '#0D2B1D', fontSize: 12, fontWeight: '900' },

  // Offers
  offerBanner: { backgroundColor: C.accent + '22', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.accent + '44', marginBottom: 16 },
  offerTitle: { fontSize: 14, fontWeight: '800', color: C.primary },
  offerSub: { fontSize: 12, color: C.textSec, marginTop: 4, lineHeight: 17 },
  offerBtn: { backgroundColor: C.primary, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 10 },
  offerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Quick links
  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickLinkCard: { width: '47%', backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border },
  quickLinkLabel: { fontSize: 11, fontWeight: '600', color: C.textSec },

  // Detail
  detailHeroImg: { width: '100%', height: 200, backgroundColor: C.border },
  detailCard: { padding: 16, backgroundColor: C.surface },
  detailName: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginTop: 4 },
  detailCat: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  detailPrice: { fontSize: 22, fontWeight: '800', color: C.primary, marginTop: 8 },
  detailUnit: { fontSize: 14, color: C.textSec, fontWeight: '400' },
  detailRating: { fontSize: 12, color: C.textSec, marginTop: 4 },
  detailSection: { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 6 },
  detailDesc: { fontSize: 13, color: C.textSec, lineHeight: 19 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  benefitText: { fontSize: 13, color: C.textSec, flex: 1 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: '600', color: C.textPrimary },
  qtyVal: { fontSize: 14, fontWeight: '700', color: C.textPrimary, minWidth: 60, textAlign: 'center' },

  // Bottom bar
  bottomBar: { backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  bottomBarLabel: { fontSize: 9, fontWeight: '700', color: C.textSec, textTransform: 'uppercase' },
  bottomBarTotal: { fontSize: 20, fontWeight: '800', color: C.primary },
  buyOnceBtn: { backgroundColor: C.surface2, borderWidth: 1.5, borderColor: C.primary, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  buyOnceBtnText: { fontSize: 12, fontWeight: '700', color: C.primary },
  subscribeBtn: { backgroundColor: C.primary, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  subscribeBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Cart
  cartItem: { backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  cartThumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: C.border },
  cartItemName: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  cartItemCat: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  cartItemPrice: { fontSize: 12, color: C.textSec, marginTop: 4 },
  removeBtn: { padding: 8 },
  cartSummary: { backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, marginTop: 8 },
  checkoutBtn: { backgroundColor: C.primary, borderRadius: 22, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  checkoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Config
  configCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  configCardTitle: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  freqPill: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, alignItems: 'center' },
  freqPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  freqPillText: { fontSize: 11, fontWeight: '600', color: C.textSec },
  freqPillTextActive: { color: '#fff', fontWeight: '700' },

  // Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  summaryLabel: { fontSize: 12, color: C.textMuted },
  summaryVal: { fontSize: 12, fontWeight: '700', color: C.textPrimary, flex: 1, textAlign: 'right' },

  // Payment
  payBanner: { backgroundColor: C.primary, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  payBannerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 },
  payBannerAmt: { fontSize: 32, fontWeight: '800', color: '#fff', marginVertical: 4 },
  payBannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  payRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: C.border },
  payRowActive: { borderColor: C.primary, backgroundColor: '#F0F9F4' },
  payRowName: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  payRowDesc: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  radioBtn: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioBtnActive: { borderColor: C.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },

  // Subscriptions
  tabStrip: { flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  tabStripBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabStripBtnActive: { borderBottomColor: C.primary },
  tabStripText: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  tabStripTextActive: { color: C.primary, fontWeight: '700' },
  subCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  subCardName: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  subCardInfo: { fontSize: 11, color: C.textSec, marginTop: 3 },
  subActionBtn: { flex: 1, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },

  // Orders
  orderCard: { backgroundColor: C.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  orderIdText: { fontSize: 12, fontWeight: '700', color: C.primary },
  orderProductText: { fontSize: 12, color: C.textSec, marginTop: 3 },
  orderMetaText: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  orderAmount: { fontSize: 15, fontWeight: '800', color: C.textPrimary },

  // Profile
  profileCard: { backgroundColor: C.primary, borderRadius: 18, padding: 24, alignItems: 'center', marginBottom: 14 },
  profileAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  profileName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  profilePhone: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  profileBadge: { backgroundColor: C.accent + '33', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8, borderWidth: 1, borderColor: C.accent + '55' },
  profileStats: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  profileStatBox: { flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  profileMenuItem: { backgroundColor: C.surface, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  profileMenuText: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  logoutBtn: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#FECACA' },

  // Misc
  screenTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
  screenSub: { fontSize: 12, color: C.textMuted, marginBottom: 16 },
});
