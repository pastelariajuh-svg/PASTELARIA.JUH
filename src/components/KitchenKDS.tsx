import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Flame,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { Order, OrderItemStatus } from '../types';
import { soundEffects } from '../services/audio';

interface KitchenKDSProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) => void;
}

export const KitchenKDS: React.FC<KitchenKDSProps> = ({
  orders,
  onUpdateOrderStatus,
  onUpdateItemStatus,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.isEnabled());
  const [filterMode, setFilterMode] = useState<'todos' | 'pendentes' | 'fritando' | 'prontos'>('pendentes');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Refresh clock every 10 seconds for accurate elapsed timers
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundEffects.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) soundEffects.playKitchenBell();
  };

  // Kitchen cares only about active orders (not closed or canceled)
  const kitchenOrders = orders.filter(
    (o) => o.status === 'cozinha_recebido' || o.status === 'em_preparo' || o.status === 'pronto'
  );

  const filteredOrders = kitchenOrders.filter((o) => {
    if (filterMode === 'pendentes') return o.status === 'cozinha_recebido';
    if (filterMode === 'fritando') return o.status === 'em_preparo';
    if (filterMode === 'prontos') return o.status === 'pronto';
    return true;
  });

  const getElapsedTime = (isoString: string) => {
    const diffMs = currentTime - new Date(isoString).getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return {
      totalMinutes,
      display: `${totalMinutes}m ${seconds < 10 ? '0' : ''}${seconds}s`,
      isLate: totalMinutes >= 20,
      isWarning: totalMinutes >= 10 && totalMinutes < 20,
    };
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* KDS Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              KDS Cozinha &middot; Fritura em Tempo Real
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {kitchenOrders.length} Comandas na Cozinha
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Marcação de tempo automática, alerta sonoro de novas comandas e controle individual de preparo.
            </p>
          </div>
        </div>

        {/* Audio control & Test Sound */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => soundEffects.playKitchenBell()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Testar campainha de cozinha"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Testar Campainha</span>
          </button>

          <button
            onClick={toggleSound}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              soundEnabled
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Alerta Sonoro Ativo' : 'Som Mutado'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterMode('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filterMode === 'todos'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Todas as Comandas ({kitchenOrders.length})
        </button>

        <button
          onClick={() => setFilterMode('pendentes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filterMode === 'pendentes'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Aguardando Fritura ({kitchenOrders.filter((o) => o.status === 'cozinha_recebido').length})
        </button>

        <button
          onClick={() => setFilterMode('fritando')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filterMode === 'fritando'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Em Preparo / Fritando ({kitchenOrders.filter((o) => o.status === 'em_preparo').length})
        </button>

        <button
          onClick={() => setFilterMode('prontos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filterMode === 'prontos'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Prontos para Servir ({kitchenOrders.filter((o) => o.status === 'pronto').length})
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <Utensils className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">Cozinha livre!</h3>
          <p className="text-xs text-slate-500">
            Nenhuma comanda pendente neste filtro. Quando um cliente ou garçom pedir, a campainha tocará aqui!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const timeInfo = getElapsedTime(order.createdAt);
            const isFinished = order.status === 'pronto';
            const isCooking = order.status === 'em_preparo';

            return (
              <div
                key={order.id}
                className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all ${
                  timeInfo.isLate && !isFinished
                    ? 'border-rose-500/80 ring-1 ring-rose-500/40'
                    : timeInfo.isWarning && !isFinished
                    ? 'border-amber-500/80 ring-1 ring-amber-500/30'
                    : 'border-slate-800'
                }`}
              >
                {/* Top Card Strip */}
                <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-white">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                        {order.tableOrType}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {order.customerName}
                    </span>
                  </div>

                  {/* Timer Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold ${
                      timeInfo.isLate
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : timeInfo.isWarning
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeInfo.display}</span>
                  </div>
                </div>

                {/* Items Checklist for Kitchen Staff */}
                <div className="p-4 space-y-2.5 flex-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Itens da Comanda ({order.items.length})
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const isItemDone = item.status === 'pronto' || item.status === 'entregue';
                      const isItemPrep = item.status === 'preparando';

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border text-xs transition-colors flex items-start justify-between gap-2 ${
                            isItemDone
                              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300 line-through'
                              : isItemPrep
                              ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="font-bold block leading-snug">{item.name}</span>
                              {item.notes && (
                                <span className="text-[11px] text-amber-400 italic block mt-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  Obs: {item.notes}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Individual Item Status Action */}
                          <div className="flex items-center gap-1 shrink-0">
                            {!isItemDone && (
                              <button
                                onClick={() =>
                                  onUpdateItemStatus(
                                    order.id,
                                    item.id,
                                    isItemPrep ? 'pronto' : 'preparando'
                                  )
                                }
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  isItemPrep
                                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                                }`}
                              >
                                {isItemPrep ? 'Pronto' : 'Fritar'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {order.notes && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <span className="font-bold">Observações gerais: </span>
                      {order.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer for Cook */}
                <div className="p-4 bg-slate-950/50 border-t border-slate-800 space-y-2">
                  {order.status === 'cozinha_recebido' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'em_preparo')}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Iniciar Fritura Geral</span>
                    </button>
                  )}

                  {order.status === 'em_preparo' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'pronto')}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Marcar Comanda Toda como Pronta!</span>
                    </button>
                  )}

                  {order.status === 'pronto' && (
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Pronto para Servir!
                      </span>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'em_preparo')}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                      >
                        Reabrir preparo
                      </button>
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
