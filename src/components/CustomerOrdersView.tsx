import React from 'react';
import {
  Clock,
  ChefHat,
  Flame,
  CheckCircle2,
  Receipt,
  Plus,
  Trash2,
  AlertCircle,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface CustomerOrdersViewProps {
  orders: Order[];
  onOrderMore: (table: string) => void;
  onRemoveItem: (orderId: string, itemId: string) => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'cozinha_recebido', label: 'Cozinha Recebeu', desc: 'Comanda na fila de pedidos' },
  { key: 'em_preparo', label: 'Em Fritura & Montagem', desc: 'Pasteis na frigideira a 180°C' },
  { key: 'pronto', label: 'Pronto para Servir!', desc: 'Retirada no balcão ou servido na mesa' },
  { key: 'finalizada_paga', label: 'Comanda Encerrada', desc: 'Pagamento confirmado no Caixa' },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'aberta':
    case 'cozinha_recebido':
      return 0;
    case 'em_preparo':
      return 1;
    case 'pronto':
      return 2;
    case 'finalizada_paga':
      return 3;
    default:
      return 0;
  }
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  orders,
  onOrderMore,
  onRemoveItem,
}) => {
  const activeOrders = orders.filter((o) => o.status !== 'cancelada');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Acompanhamento de Pedidos em Tempo Real
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe o status detalhado da sua comanda desde o recebimento até a fritura e entrega.
          </p>
        </div>

        <button
          onClick={() => onOrderMore('Mesa 01')}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Fazer Novo Pedido / Abrir Mesa</span>
        </button>
      </div>

      {activeOrders.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <UtensilsCrossed className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Nenhum pedido ativo no momento</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Abra o cardápio digital, selecione seus pastéis e bebidas favoritas e faça seu pedido!
          </p>
          <button
            onClick={() => onOrderMore('Mesa 01')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs inline-flex items-center gap-2"
          >
            Ver Cardápio Digital
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeOrders.map((order) => {
            const stepIndex = getStepIndex(order.status);
            const isOpen = order.status !== 'finalizada_paga';

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl"
              >
                {/* Comanda Header */}
                <div className="p-5 sm:p-6 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-white">
                          Comanda #{order.orderNumber}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                          {order.tableOrType}
                        </span>
                        {order.isReopened && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
                            Comanda Reaberta
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>Cliente: {order.customerName}</span>
                        <span>&middot;</span>
                        <span>{new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Action & Price */}
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total da Comanda</span>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        R$ {order.finalAmount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {isOpen && (
                      <button
                        onClick={() => onOrderMore(order.tableOrType)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                        title="Adicionar mais itens a esta comanda"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Adicionar Itens</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/40">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = stepIndex >= idx;
                      const isCurrent = stepIndex === idx;

                      return (
                        <div
                          key={step.key}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isCurrent
                              ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm ring-1 ring-amber-500/30'
                              : isCompleted
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isCurrent
                                  ? 'bg-amber-500 text-slate-950'
                                  : isCompleted
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isCompleted && !isCurrent ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                            </span>
                            <span className="text-xs font-bold">{step.label}</span>
                          </div>
                          <p className="text-[11px] leading-snug opacity-80">{step.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in this Comanda */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Itens Lançados nesta Comanda ({order.items.length})</span>
                    <span>Status na Cozinha</span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-amber-400 font-mono w-5">
                            {item.quantity}x
                          </span>
                          <div>
                            <span className="font-semibold text-slate-200 block">{item.name}</span>
                            {item.notes && (
                              <span className="text-[11px] text-amber-400/90 italic block">
                                Obs: {item.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-mono text-slate-300 font-semibold">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                              item.status === 'pronto' || item.status === 'entregue'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : item.status === 'preparando'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.status === 'recebido'
                              ? 'Na Fila'
                              : item.status === 'preparando'
                              ? 'Fritando'
                              : item.status === 'pronto'
                              ? 'Pronto'
                              : 'Entregue'}
                          </span>

                          {/* Allow removing item if comanda is still open and item not fried */}
                          {isOpen && item.status === 'recebido' && (
                            <button
                              onClick={() => onRemoveItem(order.id, item.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Cancelar este item antes da fritura"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300">
                      <span className="text-slate-400 font-semibold">Observações gerais: </span>
                      {order.notes}
                    </div>
                  )}

                  {isOpen && (
                    <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Sua comanda permanece aberta até o pagamento no Caixa. Você pode adicionar quantos itens quiser!
                      </span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
