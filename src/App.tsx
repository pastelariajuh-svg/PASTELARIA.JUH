import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import {
  Product,
  Order,
  StockItem,
  POS58Config,
  CustomerUser,
  InAppNotification,
  OrderItemStatus,
  ProductCategory,
} from './types';
import { Navbar } from './components/Navbar';
import { CustomerMenu } from './components/CustomerMenu';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { CustomerOrdersView } from './components/CustomerOrdersView';
import { KitchenKDS } from './components/KitchenKDS';
import { CashierPDV } from './components/CashierPDV';
import { SalesBook } from './components/SalesBook';
import { StockManagement } from './components/StockManagement';
import { FinancialReports } from './components/FinancialReports';
import { POS58ConfigModal } from './components/POS58ConfigModal';
import { TechnicalSheetModal } from './components/TechnicalSheetModal';
import { AuthModal } from './components/AuthModal';
import { ThermalReceipt } from './components/ThermalReceipt';
import { PushNotificationToast } from './components/PushNotificationToast';
import { CustomerLinkModal } from './components/CustomerLinkModal';
import { MerchantPinModal } from './components/MerchantPinModal';
import { bluetoothPrinter } from './services/bluetoothPrinter';
import { buildOrderEscPosBytes } from './services/escpos';
import { printOrderImmediately } from './services/printService';
import { Boxes, BookOpen, TrendingUp, Printer, Eye } from 'lucide-react';

function parseCustomerModeFromUrl(): { isCustomer: boolean; table?: string } {
  if (typeof window === 'undefined') return { isCustomer: false };

  const searchParams = new URLSearchParams(window.location.search);
  let hashParams = new URLSearchParams();
  const rawHash = window.location.hash || '';
  if (rawHash.includes('?')) {
    hashParams = new URLSearchParams(rawHash.split('?')[1]);
  } else if (rawHash.includes('&')) {
    const parts = rawHash.replace(/^#/, '').split('&');
    const queryLike = parts.slice(1).join('&');
    hashParams = new URLSearchParams(queryLike);
  }

  const modo = searchParams.get('modo') || hashParams.get('modo');
  const mesa = searchParams.get('mesa') || hashParams.get('mesa');
  const isCliente = searchParams.has('cliente') || hashParams.has('cliente');
  const hasCardapio = searchParams.has('cardapio') || hashParams.has('cardapio');
  const hashHasCardapio = rawHash.toLowerCase().includes('cardapio');

  const localMode = typeof window !== 'undefined' ? localStorage.getItem('pastelaria_mode') : null;

  const isCustomer =
    modo === 'cardapio' ||
    isCliente ||
    hasCardapio ||
    hashHasCardapio ||
    (localMode === 'customer' && !rawHash.includes('admin')) ||
    (!!mesa && !rawHash.includes('admin'));

  return { isCustomer, table: mesa || undefined };
}

export default function App() {
  const initialMode = parseCustomerModeFromUrl();

  // Database synchronized state
  const [products, setProducts] = useState<Product[]>(db.getProducts());
  const [orders, setOrders] = useState<Order[]>(db.getOrders());
  const [stock, setStock] = useState<StockItem[]>(db.getStock());
  const [posConfig, setPosConfig] = useState<POS58Config>(db.getPOSConfig());
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(db.getCurrentUser());
  const [notifications, setNotifications] = useState<InAppNotification[]>(db.getNotifications());

  // Customer-only digital menu mode
  const [isCustomerMode, setIsCustomerMode] = useState<boolean>(initialMode.isCustomer);
  const [isExitPinModalOpen, setIsExitPinModalOpen] = useState(false);

  // Navigation view
  const [currentView, setCurrentView] = useState<'menu' | 'customer_orders' | 'kitchen' | 'cashier' | 'admin'>('menu');
  const [adminSubTab, setAdminSubTab] = useState<'stock' | 'sales_book' | 'financial'>('stock');

  // Customer Table & Cart state
  const [selectedTable, setSelectedTable] = useState(initialMode.table || 'Mesa 01');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals state
  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isCustomerLinkModalOpen, setIsCustomerLinkModalOpen] = useState(false);
  const [selectedProductForSheet, setSelectedProductForSheet] = useState<Product | null>(null);

  // Active printing order (for #thermal-print-area)
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Synchronize state with DB events
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setProducts(db.getProducts());
      setOrders(db.getOrders());
      setStock(db.getStock());
      setPosConfig(db.getPOSConfig());
      setCurrentUser(db.getCurrentUser());
      setNotifications(db.getNotifications());
    });
    return () => unsubscribe();
  }, []);

  // Listen for Bluetooth connection changes
  useEffect(() => {
    const unsub = bluetoothPrinter.onConnectionChange((connected) => {
      db.updatePOSConfig({
        isConnected: connected,
        bluetoothDeviceName: bluetoothPrinter.getConnectedDeviceName() || undefined,
      });
    });
    return () => unsub();
  }, []);

  // Detect URL parameters & hash changes in real time (?modo=cardapio, #cardapio, ?mesa=01, etc.)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUrlChange = () => {
      const mode = parseCustomerModeFromUrl();
      if (mode.isCustomer) {
        setIsCustomerMode(true);
        setCurrentView('menu');
        if (mode.table) {
          setSelectedTable(mode.table);
        }
      }
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Secure navigation: if in customer mode, staff views are locked
  const handleNavigate = (view: 'menu' | 'customer_orders' | 'kitchen' | 'cashier' | 'admin') => {
    if (isCustomerMode && (view === 'kitchen' || view === 'cashier' || view === 'admin')) {
      return;
    }
    setCurrentView(view);
  };

  // Exit customer mode (opens clean PIN dialog, no window.prompt)
  const handleExitCustomerMode = () => {
    setIsExitPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setIsCustomerMode(false);
    setIsExitPinModalOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pastelaria_mode', 'merchant');
      if (window.history) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  };


  // Cart operations
  const handleAddToCart = (product: Product, quantity: number, notes?: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.notes === notes);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          product,
          quantity,
          notes,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Check if current table has an active comanda
  const activeComandaForCurrentTable = db.findActiveOrderByTableOrCustomer(
    selectedTable,
    currentUser?.name
  );

  // Confirm order from CartDrawer
  const handleConfirmOrder = (data: {
    customerName: string;
    customerCpf?: string;
    customerPhone?: string;
    tableOrType: string;
    notes?: string;
  }) => {
    db.placeOrder({
      tableOrType: data.tableOrType,
      customerName: data.customerName,
      customerCpf: data.customerCpf,
      customerPhone: data.customerPhone,
      notes: data.notes,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        notes: item.notes,
        category: item.product.category,
      })),
    });

    setCartItems([]);
    setCurrentView('customer_orders');
  };

  // Print Receipt handler: automatic and immediate (Bluetooth ESC/POS MY-7779 + isolated 58mm spooler)
  const handlePrintReceipt = async (order: Order) => {
    setPrintingOrder(order);
    await printOrderImmediately(order, posConfig);
    db.addNotification({
      orderId: order.id,
      orderNumber: order.orderNumber,
      title: `Comanda #${order.orderNumber} Impressa`,
      message: `Impressão automática imediata disparada para a MY-7779 (58mm • 32 Colunas).`,
      status: 'finalizada_paga',
    });
  };

  // Counts for Badges
  const openOrdersCount = orders.filter(
    (o) => o.status !== 'finalizada_paga' && o.status !== 'cancelada'
  ).length;

  const kitchenPendingCount = orders.filter(
    (o) => o.status === 'cozinha_recebido' || o.status === 'em_preparo'
  ).length;

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
        openOrdersCount={openOrdersCount}
        kitchenPendingCount={kitchenPendingCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPOSModal={() => setIsPOSModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        posConfig={posConfig}
        currentUser={currentUser}
        onLogout={() => db.logoutUser()}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        isCustomerMode={isCustomerMode}
        onOpenCustomerLinkModal={() => setIsCustomerLinkModalOpen(true)}
        onExitCustomerMode={handleExitCustomerMode}
        selectedTable={selectedTable}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: DIGITAL MENU */}
        {currentView === 'menu' && (
          <CustomerMenu
            products={products}
            onAddToCart={handleAddToCart}
            onOpenTechnicalSheet={(prod) => setSelectedProductForSheet(prod)}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            onOpenCart={() => setIsCartOpen(true)}
            cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
            isCustomerMode={isCustomerMode}
            onOpenCustomerLinkModal={() => setIsCustomerLinkModalOpen(true)}
          />
        )}

        {/* VIEW 2: CUSTOMER REAL-TIME ORDER TRACKING */}
        {currentView === 'customer_orders' && (
          <CustomerOrdersView
            orders={orders}
            onOrderMore={(table) => {
              setSelectedTable(table);
              setCurrentView('menu');
            }}
            onRemoveItem={(orderId, itemId) => db.removeItemFromComanda(orderId, itemId)}
          />
        )}

        {/* VIEW 3: KITCHEN KDS (Locked in Customer Mode) */}
        {!isCustomerMode && currentView === 'kitchen' && (
          <KitchenKDS
            orders={orders}
            onUpdateOrderStatus={(orderId, status) => db.updateOrderStatus(orderId, status)}
            onUpdateItemStatus={(orderId, itemId, status) =>
              db.updateOrderItemStatus(orderId, itemId, status)
            }
          />
        )}

        {/* VIEW 4: CASHIER (PDV) (Locked in Customer Mode) */}
        {!isCustomerMode && currentView === 'cashier' && (
          <CashierPDV
            orders={orders}
            products={products}
            posConfig={posConfig}
            onCloseOrder={(params) => db.closeOrderAtCashier(params)}
            onAddItemToComanda={(orderId, item) => db.addItemToComanda(orderId, item)}
            onRemoveItemFromComanda={(orderId, itemId) =>
              db.removeItemFromComanda(orderId, itemId)
            }
            onPrintReceipt={handlePrintReceipt}
          />
        )}

        {/* VIEW 5: ADMIN & GESTAO (Locked in Customer Mode) */}
        {!isCustomerMode && currentView === 'admin' && (
          <div className="space-y-6">
            
            {/* Admin Sub-navigation Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdminSubTab('stock')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                    adminSubTab === 'stock'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>Estoque &amp; Disponibilidade</span>
                </button>

                <button
                  onClick={() => setAdminSubTab('sales_book')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                    adminSubTab === 'sales_book'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Livro de Vendas &amp; Reabertura</span>
                </button>

                <button
                  onClick={() => setAdminSubTab('financial')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                    adminSubTab === 'financial'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Relatórios Financeiros Mensais</span>
                </button>
              </div>

              {/* Quick POS-58 Config Link */}
              <button
                onClick={() => setIsPOSModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-amber-400 border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Configurar Driver POS-58</span>
              </button>
            </div>

            {/* SubTab Contents */}
            {adminSubTab === 'stock' && (
              <StockManagement
                stock={stock}
                products={products}
                onUpdateStock={(id, qty) => db.updateStockItem(id, qty)}
                onAddStockDelta={(id, delta) => db.addStockMovement(id, delta)}
                onToggleProductAvailability={(id) => db.toggleProductAvailability(id)}
                onOpenTechnicalSheet={(prod) => setSelectedProductForSheet(prod)}
                onSaveProduct={(prod) => {
                  const exists = products.some((p) => p.id === prod.id);
                  if (exists) {
                    db.updateProduct(prod);
                  } else {
                    db.addProduct(prod);
                  }
                }}
                onDeleteProduct={(id) => db.deleteProduct(id)}
                onSaveStockItem={(item) => {
                  const exists = stock.some((s) => s.id === item.id);
                  if (exists) {
                    db.updateStockItem(item.id, item.currentQuantity);
                  } else {
                    db.addStockItem(item);
                  }
                }}
                onDeleteStockItem={(id) => db.deleteStockItem(id)}
                onPurgeData={() => db.purgeAllData()}
              />
            )}

            {adminSubTab === 'sales_book' && (
              <SalesBook
                orders={orders}
                posConfig={posConfig}
                onReopenOrder={(id) => db.reopenOrder(id)}
                onDeleteOrder={(id) => db.deleteOrder(id, true)}
                onPrintReceipt={handlePrintReceipt}
              />
            )}

            {adminSubTab === 'financial' && <FinancialReports />}

          </div>
        )}

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        selectedTable={selectedTable}
        onSelectTable={setSelectedTable}
        currentUser={currentUser}
        hasActiveOpenComanda={!!activeComandaForCurrentTable}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* POS-58 Configuration Modal */}
      <POS58ConfigModal
        isOpen={isPOSModalOpen}
        onClose={() => setIsPOSModalOpen(false)}
        config={posConfig}
        onSaveConfig={(cfg) => db.updatePOSConfig(cfg)}
      />

      {/* Technical Sheet Modal */}
      <TechnicalSheetModal
        product={selectedProductForSheet}
        onClose={() => setSelectedProductForSheet(null)}
        isManager={currentView === 'admin' || currentView === 'cashier'}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          // auto fill customer name for orders
        }}
      />

      {/* Customer Digital Menu Link & QR Code Modal */}
      <CustomerLinkModal
        isOpen={isCustomerLinkModalOpen}
        onClose={() => setIsCustomerLinkModalOpen(false)}
        currentTable={selectedTable}
        onEnterCustomerMode={(table) => {
          if (table) setSelectedTable(table);
          setIsCustomerMode(true);
          setCurrentView('menu');
          setIsCustomerLinkModalOpen(false);
        }}
      />

      {/* Merchant PIN Modal */}
      <MerchantPinModal
        isOpen={isExitPinModalOpen}
        onClose={() => setIsExitPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* In-App Floating Push Notification Toasts & Drawer */}
      <PushNotificationToast
        notifications={notifications}
        onDismiss={(id) => db.markNotificationAsRead(id)}
        isOpenList={isNotifsOpen}
        onCloseList={() => setIsNotifsOpen(false)}
        onClearAll={() => db.clearNotifications()}
      />

      {/* Printable Thermal Receipt (Strictly hidden on screen, active only in @media print) */}
      <div className="hidden print:block" style={{ display: 'none' }} aria-hidden="true">
        <ThermalReceipt order={printingOrder} config={posConfig} />
      </div>

    </div>
  );
}
