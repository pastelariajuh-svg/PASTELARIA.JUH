import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Info,
  Check,
  ShoppingBag,
  Sparkles,
  Utensils,
  Coffee,
  IceCream,
  Sandwich,
  Layers,
  MapPin,
  Clock,
  Flame,
  CheckCircle2,
  QrCode,
} from 'lucide-react';
import { Product, ProductCategory } from '../types';

interface CustomerMenuProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number, notes?: string) => void;
  onOpenTechnicalSheet: (product: Product) => void;
  selectedTable: string;
  onSelectTable: (table: string) => void;
  onOpenCart: () => void;
  cartCount: number;
  isCustomerMode?: boolean;
  onOpenCustomerLinkModal?: () => void;
}

const CATEGORIES: { id: ProductCategory | 'todos'; label: string; icon: React.ElementType }[] = [
  { id: 'todos', label: 'Todos os Itens', icon: Utensils },
  { id: 'pasteis-salgados-doces', label: 'Pastéis Salgados & Doces', icon: Layers },
  { id: 'combos', label: 'Combos Especiais', icon: Sparkles },
  { id: 'sanduiches', label: 'Sanduíches & X-Pastel', icon: Sandwich },
  { id: 'salgados', label: 'Salgados Fritos & Assados', icon: Utensils },
  { id: 'bebidas-sucos-refrigerantes', label: 'Bebidas & Caldo de Cana', icon: Coffee },
  { id: 'doces', label: 'Sobremesas & Doces', icon: IceCream },
];

const TABLES = [
  'Mesa 01', 'Mesa 02', 'Mesa 03', 'Mesa 04', 'Mesa 05',
  'Mesa 06', 'Mesa 07', 'Mesa 08', 'Mesa 09', 'Mesa 10',
  'Balcão', 'Viagem (Para Levar)'
];

function getCategoryIcon(cat: ProductCategory) {
  switch (cat) {
    case 'pasteis-salgados-doces':
      return Layers;
    case 'combos':
      return Sparkles;
    case 'sanduiches':
      return Sandwich;
    case 'salgados':
      return Utensils;
    case 'bebidas-sucos-refrigerantes':
      return Coffee;
    case 'doces':
      return IceCream;
    default:
      return Utensils;
  }
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  products,
  onAddToCart,
  onOpenTechnicalSheet,
  selectedTable,
  onSelectTable,
  onOpenCart,
  cartCount,
  isCustomerMode = false,
  onOpenCustomerLinkModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [showNotesForId, setShowNotesForId] = useState<string | null>(null);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'todos' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getQty = (id: string) => itemQuantities[id] || 1;

  const handleQtyChange = (id: string, delta: number) => {
    const current = getQty(id);
    const next = Math.max(1, Math.min(20, current + delta));
    setItemQuantities((prev) => ({ ...prev, [id]: next }));
  };

  const handleAdd = (product: Product) => {
    const qty = getQty(product.id);
    const notes = itemNotes[product.id];
    onAddToCart(product, qty, notes);

    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1200);

    // Reset notes input
    setShowNotesForId(null);
    setItemNotes((prev) => ({ ...prev, [product.id]: '' }));
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Hero Showcase Section - Clean Typography & Feature Strip */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text / Action Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>PASTELARIA ARTESANAL &middot; CARDÁPIO DIGITAL &amp; COMANDAS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
              Massa crocante artesanal, recheio generoso até a ponta.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Faça o pedido direto para a sua mesa ou balcão. Sua comanda fica aberta para adicionar mais itens a qualquer momento, integrada com a cozinha e o caixa.
            </p>

            {/* Table Selector Strip */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Local do Pedido:</span>
                <select
                  value={selectedTable}
                  onChange={(e) => onSelectTable(e.target.value)}
                  className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
                >
                  {TABLES.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>


              {cartCount > 0 && (
                <button
                  onClick={onOpenCart}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ver Comanda ({cartCount} itens)</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Highlights Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Frito na Hora a 180°C</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Massa sequinha, dourada e crocante preparada no momento do pedido.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Comanda Integrada Cozinha &amp; Caixa</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Acompanhe em tempo real o status desde a fritura até a entrega.
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Search & Categories Bar */}
      <section className="space-y-4">
        
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pasteis, caldo de cana, salgados, combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/80 transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {selectedCategory === 'todos'
              ? 'Todos os Produtos'
              : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          </h2>
          <span className="text-xs text-slate-400 tabular-nums">
            {filteredProducts.length} itens disponíveis
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
            <Utensils className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">Nenhum produto encontrado</h3>
            <p className="text-xs text-slate-500">Tente buscar por outro termo ou escolha outra categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProducts.map((prod) => {
              const qty = getQty(prod.id);
              const isAdded = addedAnimationId === prod.id;
              const hasNotesOpen = showNotesForId === prod.id;
              const CatIcon = getCategoryIcon(prod.category);

              return (
                <div
                  key={prod.id}
                  className={`flex flex-col justify-between bg-slate-900 border rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-700 ${
                    !prod.isAvailable ? 'opacity-60 grayscale' : 'border-slate-800'
                  }`}
                >
                  {/* Card Header Strip with Category Icon and Badge */}
                  <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                        <CatIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="capitalize">{prod.category.replace(/-/g, ' ')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {prod.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                          {prod.badge}
                        </span>
                      )}
                      <button
                        onClick={() => onOpenTechnicalSheet(prod)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Ver Ficha Técnica do Produto"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {prod.imageUrl && (
                        <div className="w-full h-36 overflow-hidden rounded-xl bg-slate-950 border border-slate-800 mb-3">
                          <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold text-white leading-snug">
                          {prod.name}
                        </h3>
                        <span className="text-base font-extrabold text-amber-400 font-mono whitespace-nowrap">
                          R$ {prod.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>

                      {/* Metadata line */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Preparo: {prod.technicalSheet.prepTimeMinutes} min</span>
                        <span>&middot;</span>
                        <span>{prod.stockQuantity} un disponíveis</span>
                      </div>
                    </div>

                    {/* Notes field (expandable) */}
                    {hasNotesOpen && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-semibold text-slate-400 block">
                          Observação para a cozinha:
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Sem cebola, bem frito..."
                          value={itemNotes[prod.id] || ''}
                          onChange={(e) =>
                            setItemNotes((prev) => ({ ...prev, [prod.id]: e.target.value }))
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}

                    {/* Bottom Action Controls */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNotesForId(hasNotesOpen ? null : prod.id)}
                          className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
                        >
                          {hasNotesOpen ? 'Fechar obs' : '+ Adicionar observação'}
                        </button>

                        {/* Quantity Stepper */}
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(prod.id, -1)}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono text-xs font-bold text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(prod.id, 1)}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Main Add Button */}
                      <button
                        onClick={() => handleAdd(prod)}
                        disabled={!prod.isAvailable}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Adicionado à Comanda!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Adicionar à Comanda (R$ {(prod.price * qty).toFixed(2).replace('.', ',')})</span>
                          </>
                        )}
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
