import React from 'react';
import { X, Clock, Flame, AlertCircle, ChefHat, Check } from 'lucide-react';
import { Product } from '../types';

interface TechnicalSheetModalProps {
  product: Product | null;
  onClose: () => void;
  isManager?: boolean;
}

export const TechnicalSheetModal: React.FC<TechnicalSheetModalProps> = ({
  product,
  onClose,
  isManager = false,
}) => {
  if (!product) return null;

  const sheet = product.technicalSheet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ficha Técnica do Produto</h3>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">Tempo de Preparo</span>
                <span className="font-semibold text-slate-200">{sheet.prepTimeMinutes} minutos</span>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">Rendimento</span>
                <span className="font-semibold text-slate-200">{sheet.yieldPortions} porção</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Descrição &amp; Características
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-slate-800/80">
              {product.description}
            </p>
          </div>

          {/* Ingredients Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Composição &amp; Insumos da Receita
            </h4>
            <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              {sheet.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0"
                >
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
                    <span>{ing.name}</span>
                  </div>
                  <div className="font-mono text-slate-400">
                    {ing.quantity} {ing.unit}
                    {isManager && (
                      <span className="ml-2 text-amber-400 text-[11px]">
                        (R$ {ing.costPerUnit.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {sheet.prepInstructions && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Modo de Fritura &amp; Montagem
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                {sheet.prepInstructions}
              </p>
            </div>
          )}

          {/* Allergens warning */}
          {sheet.allergens && sheet.allergens.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Aviso para Alérgicos:</span>
                <span>Contém {sheet.allergens.join(', ')}.</span>
              </div>
            </div>
          )}

          {/* Cost analysis for Manager */}
          {isManager && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Custo Estimado dos Insumos (CMV): </span>
                <span className="font-bold text-amber-400">R$ {sheet.totalCostBrl.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400">Preço de Venda: </span>
                <span className="font-bold text-emerald-400">R$ {product.price.toFixed(2)}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
