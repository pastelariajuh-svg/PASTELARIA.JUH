import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Search,
  Eye,
  Sliders,
  RotateCcw,
  UtensilsCrossed,
  Package,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  Layers,
  Sandwich,
  Coffee,
  IceCream,
  Utensils,
  Image as ImageIcon,
} from 'lucide-react';
import { StockItem, Product, ProductCategory } from '../types';
import { ProductModal } from './ProductModal';
import { StockItemModal } from './StockItemModal';

interface StockManagementProps {
  stock: StockItem[];
  products: Product[];
  onUpdateStock: (id: string, qty: number) => void;
  onAddStockDelta: (id: string, delta: number) => void;
  onToggleProductAvailability: (id: string) => void;
  onOpenTechnicalSheet: (product: Product) => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSaveStockItem: (item: StockItem) => void;
  onDeleteStockItem: (id: string) => void;
  onPurgeData?: () => void;
}

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

export const StockManagement: React.FC<StockManagementProps> = ({
  stock,
  products,
  onUpdateStock,
  onAddStockDelta,
  onToggleProductAvailability,
  onOpenTechnicalSheet,
  onSaveProduct,
  onDeleteProduct,
  onSaveStockItem,
  onDeleteStockItem,
}) => {
  const [activeTab, setActiveTab] = useState<'insumos' | 'cardapio_produtos'>('cardapio_produtos');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAddModalItem, setQuickAddModalItem] = useState<StockItem | null>(null);
  const [entryQty, setEntryQty] = useState('');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingStockItem, setEditingStockItem] = useState<StockItem | null>(null);

  const lowStockItems = stock.filter((s) => s.currentQuantity <= s.minQuantity);

  const filteredStock = stock.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmEntry = () => {
    if (!quickAddModalItem) return;
    const delta = parseFloat(entryQty.replace(',', '.'));
    if (!isNaN(delta) && delta > 0) {
      onAddStockDelta(quickAddModalItem.id, delta);
    }
    setQuickAddModalItem(null);
    setEntryQty('');
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleDeleteProd = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover o produto "${name}" do cardápio?`)) {
      onDeleteProduct(id);
    }
  };

  const handleOpenAddStock = () => {
    setEditingStockItem(null);
    setIsStockModalOpen(true);
  };

  const handleOpenEditStock = (item: StockItem) => {
    setEditingStockItem(item);
    setIsStockModalOpen(true);
  };

  const handleDeleteStock = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover o insumo "${name}" do estoque?`)) {
      onDeleteStockItem(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Gestão de Cardápio, Categorias &amp; Estoque
            </h2>
            <p className="text-xs text-slate-400">
              Cadastre produtos com fichas técnicas, controle insumos e vincule disponibilidade ao cardápio digital.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddProduct}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </button>

          <button
            onClick={handleOpenAddStock}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Novo Insumo</span>
          </button>
        </div>
      </div>

      {/* Low stock warning if any */}
      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Atenção: {lowStockItems.length} insumo(s) abaixo da quantidade mínima recomendada!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('cardapio_produtos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'cardapio_produtos'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Produtos no Cardápio &amp; Categorias ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('insumos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'insumos'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Insumos &amp; Matéria-Prima ({stock.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={
            activeTab === 'cardapio_produtos'
              ? 'Pesquisar produto no cardápio por nome ou categoria...'
              : 'Pesquisar insumo (ex: massa, queijo, carne, óleo)...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* TAB 1: PRODUTOS NO CARDÁPIO */}
      {activeTab === 'cardapio_produtos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Preço Venda</th>
                  <th className="py-3 px-4">Estoque</th>
                  <th className="py-3 px-4">Visibilidade</th>
                  <th className="py-3 px-4">Ficha Técnica</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Nenhum produto cadastrado. Clique em <strong>"Cadastrar Produto"</strong> acima para adicionar seus itens reais!
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const CatIcon = getCategoryIcon(p.category);

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                                <CatIcon className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <span className="font-semibold text-white block">{p.name}</span>
                              {p.badge && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold inline-block mt-0.5">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 capitalize">
                          {p.category.replace(/-/g, ' ')}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          R$ {p.price.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {p.stockQuantity} un
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => onToggleProductAvailability(p.id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                              p.isAvailable
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {p.isAvailable ? 'Ativo no Cardápio' : 'Pausado'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => onOpenTechnicalSheet(p)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs inline-flex items-center gap-1 transition-colors border border-slate-700 cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5 text-amber-400" />
                            <span>Ver Ficha</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Editar Produto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProd(p.id, p.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Excluir Produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INSUMOS */}
      {activeTab === 'insumos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Insumo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Estoque Atual</th>
                  <th className="py-3 px-4">Mínimo</th>
                  <th className="py-3 px-4">Custo Un.</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Nenhum insumo cadastrado. Clique em <strong>"Novo Insumo"</strong> acima para registrar a matéria-prima da sua pastelaria.
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((item) => {
                    const isLow = item.currentQuantity <= item.minQuantity;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            {isLow ? (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Estoque Baixo" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            )}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{item.category}</td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className={isLow ? 'text-rose-400' : 'text-slate-200'}>
                            {item.currentQuantity} {item.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {item.minQuantity} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-400">
                          R$ {item.costPerUnit.toFixed(2)} / {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setQuickAddModalItem(item)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Entrada</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditStock(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Editar Insumo"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStock(item.id, item.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Excluir Insumo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Add Stock Modal */}
      {quickAddModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Entrada de Estoque: {quickAddModalItem.name}
            </h3>
            <p className="text-xs text-slate-400">
              Estoque atual: <strong>{quickAddModalItem.currentQuantity} {quickAddModalItem.unit}</strong>
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Quantidade a Adicionar ({quickAddModalItem.unit})
              </label>
              <input
                type="text"
                placeholder="Ex: 10 ou 2.5"
                value={entryQty}
                onChange={(e) => setEntryQty(e.target.value)}
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setQuickAddModalItem(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEntry}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Confirmar Entrada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Registration / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={onSaveProduct}
        editingProduct={editingProduct}
        availableStock={stock}
      />

      {/* Stock Item Modal */}
      <StockItemModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSave={onSaveStockItem}
        editingItem={editingStockItem}
      />

    </div>
  );
};
