import React, { useState } from 'react';
import {
  X,
  Trash2,
  Send,
  Plus,
  Minus,
  MapPin,
  User,
  Phone,
  FileText,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { Product, ProductCategory, CustomerUser } from '../types';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  selectedTable: string;
  onSelectTable: (table: string) => void;
  currentUser: CustomerUser | null;
  hasActiveOpenComanda: boolean;
  onConfirmOrder: (data: {
    customerName: string;
    customerCpf?: string;
    customerPhone?: string;
    tableOrType: string;
    notes?: string;
  }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedTable,
  currentUser,
  hasActiveOpenComanda,
  onConfirmOrder,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerCpf, setCustomerCpf] = useState(currentUser?.cpf || '');
  const [generalNotes, setGeneralNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Por favor informe o nome do cliente para a comanda.');
      return;
    }

    onConfirmOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerCpf: customerCpf.trim() || undefined,
      tableOrType: selectedTable,
      notes: generalNotes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Comanda Digital</h3>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedTable}</span>
                {hasActiveOpenComanda && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold ml-1">
                    Comanda Aberta
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {hasActiveOpenComanda && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Atenção:</span>
                Já existe uma comanda aberta nesta mesa. Estes itens serão adicionados automaticamente à mesma comanda e enviados para a cozinha!
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Sua sacola está vazia</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explore os deliciosos pastéis, combos e bebidas e adicione à sua comanda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Itens Selecionados ({items.length})
                </span>
                <button
                  onClick={onClearCart}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Limpar tudo
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white">{item.product.name}</h4>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                        R$ {item.product.price.toFixed(2).replace('.', ',')} un
                      </div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-400 italic mt-1 bg-slate-900/60 p-1.5 rounded border border-slate-800">
                          Obs: {item.notes}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stepper & Line Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-white">
                      R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Identification Inputs */}
          {items.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Identificação do Cliente
              </span>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Oliveira"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Celular / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    CPF (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={customerCpf}
                    onChange={(e) => setCustomerCpf(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Observações Gerais da Comanda
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    placeholder="Alguma orientação especial para a entrega ou preparo..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                  {errorMsg}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Subtotal & Action */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Subtotal dos Itens:</span>
              <span className="font-mono font-bold text-white text-base">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {hasActiveOpenComanda
                  ? 'Adicionar Itens à Comanda Aberta'
                  : 'Enviar Comanda para Cozinha & Caixa'}
              </span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              A comanda ficará aberta permitindo você adicionar mais pastéis ou bebidas a qualquer momento.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
