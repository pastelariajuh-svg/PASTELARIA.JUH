import React, { useState, useEffect } from 'react';
import { X, Package, CheckCircle2, DollarSign } from 'lucide-react';
import { StockItem } from '../types';

interface StockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: StockItem) => void;
  editingItem: StockItem | null;
}

const STOCK_CATEGORIES = [
  'Massas',
  'Carnes & Recheios',
  'Frios & Laticínios',
  'Vegetais & Conservas',
  'Doces & Sobremesas',
  'Óleos & Gorduras',
  'Hortifruti',
  'Bebidas Industrializadas',
  'Embalagens & Descartáveis',
];

export const StockItemModal: React.FC<StockItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(STOCK_CATEGORIES[0]);
  const [currentQuantity, setCurrentQuantity] = useState('10');
  const [minQuantity, setMinQuantity] = useState('3');
  const [unit, setUnit] = useState<'kg' | 'g' | 'l' | 'ml' | 'un'>('un');
  const [costPerUnit, setCostPerUnit] = useState('1.50');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category);
      setCurrentQuantity(editingItem.currentQuantity.toString());
      setMinQuantity(editingItem.minQuantity.toString());
      setUnit(editingItem.unit);
      setCostPerUnit(editingItem.costPerUnit.toString());
    } else {
      setName('');
      setCategory(STOCK_CATEGORIES[0]);
      setCurrentQuantity('10');
      setMinQuantity('3');
      setUnit('un');
      setCostPerUnit('1.50');
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: StockItem = {
      id: editingItem ? editingItem.id : `stk_${Date.now()}`,
      name: name.trim(),
      category,
      currentQuantity: parseFloat(currentQuantity.replace(',', '.')) || 0,
      minQuantity: parseFloat(minQuantity.replace(',', '.')) || 1,
      unit,
      costPerUnit: parseFloat(costPerUnit.replace(',', '.')) || 0,
      lastUpdated: new Date().toISOString(),
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingItem ? 'Editar Insumo de Estoque' : 'Cadastrar Novo Insumo'}
              </h2>
              <p className="text-xs text-slate-400">
                Matéria-prima vinculada às receitas e fichas técnicas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nome do Insumo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Queijo Mussarela Ralado, Carne Moída..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Categoria de Estoque
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {STOCK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="un">un (Unidades)</option>
                <option value="kg">kg (Quilogramas)</option>
                <option value="g">g (Gramas)</option>
                <option value="l">l (Litros)</option>
                <option value="ml">ml (Mililitros)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Estoque Atual
              </label>
              <input
                type="text"
                required
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Estoque Mínimo
              </label>
              <input
                type="text"
                required
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Custo Un. (R$)
              </label>
              <input
                type="text"
                required
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Insumo</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
