import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ChefHat,
  Clock,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Package,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { Product, ProductCategory, StockItem, RecipeIngredient } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editingProduct: Product | null;
  availableStock: StockItem[];
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'pasteis-salgados-doces', label: 'PASTEIS SALGADOS E DOCES' },
  { id: 'sanduiches', label: 'SANDUICHES' },
  { id: 'salgados', label: 'SALGADOS' },
  { id: 'bebidas-sucos-refrigerantes', label: 'BEBIDAS SUCOS E REFRIGERANTES' },
  { id: 'doces', label: 'DOCES' },
  { id: 'combos', label: 'COMBOS' },
];

const COMMON_ALLERGENS = [
  'Glúten',
  'Lactose',
  'Derivados de Leite',
  'Ovos',
  'Soja',
  'Crustáceos',
  'Oleaginosas / Nozes',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  availableStock,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('pasteis-salgados-doces');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [minStockWarning, setMinStockWarning] = useState('10');
  const [badge, setBadge] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Technical Sheet state
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('6');
  const [yieldPortions, setYieldPortions] = useState('1');
  const [prepInstructions, setPrepInstructions] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  // Temp ingredient addition
  const [selectedStockId, setSelectedStockId] = useState('');
  const [ingQuantity, setIngQuantity] = useState('');
  const [customIngName, setCustomIngName] = useState('');
  const [customIngUnit, setCustomIngUnit] = useState<'g' | 'ml' | 'un' | 'kg' | 'l'>('un');
  const [customIngCost, setCustomIngCost] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setPrice(editingProduct.price.toString());
      setDescription(editingProduct.description);
      setImageUrl(editingProduct.imageUrl || '');
      setStockQuantity(editingProduct.stockQuantity.toString());
      setMinStockWarning(editingProduct.minStockWarning.toString());
      setBadge(editingProduct.badge || '');
      setIsAvailable(editingProduct.isAvailable);

      if (editingProduct.technicalSheet) {
        setPrepTimeMinutes(editingProduct.technicalSheet.prepTimeMinutes.toString());
        setYieldPortions(editingProduct.technicalSheet.yieldPortions.toString());
        setPrepInstructions(editingProduct.technicalSheet.prepInstructions || '');
        setIngredients(editingProduct.technicalSheet.ingredients || []);
        setSelectedAllergens(editingProduct.technicalSheet.allergens || []);
      }
    } else {
      // Default clean values for new product
      setName('');
      setCategory('pasteis-salgados-doces');
      setPrice('');
      setDescription('');
      setImageUrl('');
      setStockQuantity('50');
      setMinStockWarning('10');
      setBadge('');
      setIsAvailable(true);
      setPrepTimeMinutes('5');
      setYieldPortions('1');
      setPrepInstructions('');
      setIngredients([]);
      setSelectedAllergens([]);
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    let newIng: RecipeIngredient | null = null;

    if (selectedStockId) {
      const stockItem = availableStock.find((s) => s.id === selectedStockId);
      if (stockItem) {
        const qty = parseFloat(ingQuantity.replace(',', '.')) || 1;
        const totalCost = Number((qty * stockItem.costPerUnit).toFixed(2));
        newIng = {
          id: stockItem.id,
          name: stockItem.name,
          quantity: qty,
          unit: stockItem.unit,
          costPerUnit: totalCost,
        };
      }
    } else if (customIngName.trim()) {
      const qty = parseFloat(ingQuantity.replace(',', '.')) || 1;
      const cost = parseFloat(customIngCost.replace(',', '.')) || 0;
      newIng = {
        id: `ing_cust_${Date.now()}`,
        name: customIngName.trim(),
        quantity: qty,
        unit: customIngUnit,
        costPerUnit: cost,
      };
    }

    if (newIng) {
      setIngredients((prev) => [...prev, newIng!]);
      setSelectedStockId('');
      setIngQuantity('');
      setCustomIngName('');
      setCustomIngCost('');
    }
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleAllergen = (item: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatedTotalCost = ingredients.reduce((sum, ing) => sum + (ing.costPerUnit || 0), 0);
  const numericPrice = parseFloat(price.replace(',', '.')) || 0;
  const estimatedMargin = numericPrice > 0 ? ((numericPrice - calculatedTotalCost) / numericPrice) * 100 : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Por favor, informe o nome e o preço do produto.');
      return;
    }

    const savedProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
      name: name.trim(),
      category,
      price: numericPrice,
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      stockQuantity: parseInt(stockQuantity, 10) || 0,
      minStockWarning: parseInt(minStockWarning, 10) || 5,
      badge: badge.trim() || undefined,
      isAvailable,
      technicalSheet: {
        prepTimeMinutes: parseInt(prepTimeMinutes, 10) || 5,
        yieldPortions: parseInt(yieldPortions, 10) || 1,
        totalCostBrl: Number(calculatedTotalCost.toFixed(2)),
        prepInstructions: prepInstructions.trim(),
        ingredients,
        allergens: selectedAllergens,
      },
    };

    onSave(savedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'Editar Produto do Cardápio' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-xs text-slate-400">
                Dados do produto, vinculação com o cardápio e ficha técnica de preparo
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
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1. Identificação do Produto &amp; Categoria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Categoria Obrigatória *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 18,50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Pastel de Carne com Queijo e Azeitonas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Descrição Detalhada para o Cliente
              </label>
              <textarea
                rows={2}
                placeholder="Descreva os recheios, crocância da massa e diferenciais para facilitar a escolha..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Estoque Inicial (un)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Alerta Mínimo (un)
                </label>
                <input
                  type="number"
                  min="1"
                  value={minStockWarning}
                  onChange={(e) => setMinStockWarning(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Destaque / Badge
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mais Pedido, Especial"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Photo Upload (Real photo, NO fake image) */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Foto Real do Produto (Opcional - Tire foto ou faça upload)
              </label>
              <div className="flex items-center gap-3">
                <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-2 border border-slate-700 transition-colors">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Escolher Foto do Aparelho</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {imageUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={imageUrl}
                      alt="Prévia"
                      className="w-10 h-10 rounded-lg object-cover border border-amber-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remover foto
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="isAvailableToggle"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="isAvailableToggle" className="text-xs font-semibold text-slate-200 cursor-pointer">
                Exibir este produto no Cardápio Digital (Ativo para pedidos)
              </label>
            </div>
          </div>

          {/* Section 2: Technical Sheet (Ficha Técnica) */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ChefHat className="w-4 h-4" />
                2. Ficha Técnica &amp; Custo dos Insumos
              </h3>
              <div className="text-xs font-mono font-bold text-slate-300">
                Custo Insumos: <span className="text-amber-400">R$ {calculatedTotalCost.toFixed(2)}</span>
                {numericPrice > 0 && (
                  <span className="text-emerald-400 ml-2">
                    (Margem: {estimatedMargin.toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tempo Médio de Preparo (Minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  value={prepTimeMinutes}
                  onChange={(e) => setPrepTimeMinutes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Rendimento (Porções)
                </label>
                <input
                  type="number"
                  min="1"
                  value={yieldPortions}
                  onChange={(e) => setYieldPortions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Ingredients table */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-200 block">
                Insumos Utilizados na Receita
              </span>

              {ingredients.length > 0 ? (
                <div className="divide-y divide-slate-800 text-xs">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-white font-semibold">{ing.name}</span>
                        <span className="text-slate-400 ml-2">
                          ({ing.quantity} {ing.unit})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-mono">
                          R$ {(ing.costPerUnit || 0).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Nenhum insumo vinculado ainda. Adicione insumos abaixo para calcular o custo.
                </p>
              )}

              {/* Add ingredient controls */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-5">
                  <select
                    value={selectedStockId}
                    onChange={(e) => setSelectedStockId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">Selecionar Insumo do Estoque...</option>
                    {availableStock.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.unit}) - R$ {s.costPerUnit.toFixed(2)}/{s.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Quantidade (ex: 0.12 ou 1)"
                    value={ingQuantity}
                    onChange={(e) => setIngQuantity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="w-full px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preparation instructions */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Instruções de Preparo para a Cozinha
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Fritar em óleo vegetal a 180°C por 4 minutos até dourar e secar bem..."
                value={prepInstructions}
                onChange={(e) => setPrepInstructions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Allergens tags */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Alérgenos Presentes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGENS.map((all) => {
                  const isChecked = selectedAllergens.includes(all);
                  return (
                    <button
                      type="button"
                      key={all}
                      onClick={() => toggleAllergen(all)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        isChecked
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {all}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
