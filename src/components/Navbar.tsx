import React from 'react';
import {
  Printer,
  ShoppingBag,
  ChefHat,
  Receipt,
  BarChart3,
  UtensilsCrossed,
  User,
  LogOut,
  Bell,
  Clock,
  QrCode,
  MapPin,
  Lock,
  Smartphone,
  LayoutDashboard,
} from 'lucide-react';
import { CustomerUser, POS58Config } from '../types';

interface NavbarProps {
  currentView: 'menu' | 'customer_orders' | 'kitchen' | 'cashier' | 'admin';
  onNavigate: (view: 'menu' | 'customer_orders' | 'kitchen' | 'cashier' | 'admin') => void;
  cartCount: number;
  openOrdersCount: number;
  kitchenPendingCount: number;
  onOpenCart: () => void;
  onOpenPOSModal: () => void;
  onOpenAuthModal: () => void;
  posConfig: POS58Config;
  currentUser: CustomerUser | null;
  onLogout: () => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  isCustomerMode?: boolean;
  onOpenCustomerLinkModal?: () => void;
  onExitCustomerMode?: () => void;
  selectedTable?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  kitchenPendingCount,
  openOrdersCount,
  onOpenCart,
  onOpenPOSModal,
  onOpenAuthModal,
  posConfig,
  currentUser,
  onLogout,
  unreadNotifsCount,
  onOpenNotifications,
  isCustomerMode = false,
  onOpenCustomerLinkModal,
  onExitCustomerMode,
  selectedTable,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('menu')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap block">
                  Pastelaria Juh
                </span>
                <span className="text-[11px] font-medium text-amber-400/90 tracking-wide block -mt-1">
                  {isCustomerMode ? 'Cardápio Digital' : 'Cardápio & Comandas'}
                </span>
              </div>
            </button>

            {/* In Customer Mode: Show Selected Table Badge */}
            {isCustomerMode && selectedTable && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedTable}</span>
              </div>
            )}
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('menu')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                currentView === 'menu'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Cardápio Digital
            </button>

            <button
              onClick={() => onNavigate('customer_orders')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                currentView === 'customer_orders'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              Meus Pedidos
            </button>

            {/* Staff-only Views (Hidden in Customer Mode) */}
            {!isCustomerMode && (
              <>
                <button
                  onClick={() => onNavigate('kitchen')}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'kitchen'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  Cozinha (KDS)
                  {kitchenPendingCount > 0 && (
                    <span className="ml-1 text-[11px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 tabular-nums">
                      {kitchenPendingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('cashier')}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'cashier'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  Caixa (PDV)
                  {openOrdersCount > 0 && (
                    <span className="ml-1 text-[11px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950 tabular-nums">
                      {openOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Gestão &amp; Estoque
                </button>
              </>
            )}
          </nav>


          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Merchant Only: Customer Link Generator Button */}
            {!isCustomerMode && onOpenCustomerLinkModal && (
              <button
                onClick={onOpenCustomerLinkModal}
                title="Criar e copiar link exclusivo do cardápio para clientes"
                className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Link do Cardápio</span>
              </button>
            )}

            {/* Merchant Only: POS-58 Printer button */}
            {!isCustomerMode && (
              <button
                onClick={onOpenPOSModal}
                title={`Configuração da Impressora POS-58 (${posConfig.printerModel})`}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  posConfig.isConnected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {posConfig.isConnected ? 'POS-58 Conectada' : 'Driver POS-58'}
                </span>
              </button>
            )}

            {/* Merchant Only: Notifications button */}
            {!isCustomerMode && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Notificações em tempo real"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 flex items-center justify-center tabular-nums">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Cart button (Visible for both customer & staff) */}
            <button
              onClick={onOpenCart}
              className="relative px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Comanda / Sacola</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[11px] font-bold tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-medium text-slate-200 block truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {currentUser.cpf ? currentUser.cpf.substring(0, 7) + '***' : 'Cliente'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {/* Customer Mode: Exit to Merchant Area (Optional switch) */}
            {isCustomerMode && onExitCustomerMode && (
              <button
                onClick={onExitCustomerMode}
                title="Acessar Modo Gerencial / Lojista"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Lojista</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800 bg-slate-950/90 py-2 px-1 text-[11px]">
        <button
          onClick={() => onNavigate('menu')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md ${
            currentView === 'menu' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Cardápio</span>
        </button>

        <button
          onClick={() => onNavigate('customer_orders')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md ${
            currentView === 'customer_orders' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pedidos</span>
        </button>

        {/* Mobile: Staff items hidden in Customer Mode */}
        {!isCustomerMode && (
          <>
            <button
              onClick={() => onNavigate('kitchen')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md relative ${
                currentView === 'kitchen' ? 'text-amber-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Cozinha</span>
              {kitchenPendingCount > 0 && (
                <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                  {kitchenPendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('cashier')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md relative ${
                currentView === 'cashier' ? 'text-amber-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Caixa</span>
              {openOrdersCount > 0 && (
                <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                  {openOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md ${
                currentView === 'admin' ? 'text-amber-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </>
        )}

      </div>
    </header>
  );
};
