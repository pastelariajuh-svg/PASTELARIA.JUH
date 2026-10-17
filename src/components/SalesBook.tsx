import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  RotateCcw,
  Printer,
  Trash2,
  Eye,
  Calendar,
  X,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Apple,
  Zap,
} from 'lucide-react';
import { Order, POS58Config } from '../types';
import { ThermalReceipt } from './ThermalReceipt';
import { bluetoothPrinter } from '../services/bluetoothPrinter';
import { buildOrderEscPosBytes, generatePOS58ReceiptText } from '../services/escpos';
import { printOrderImmediately } from '../services/printService';

interface SalesBookProps {
  orders: Order[];
  posConfig: POS58Config;
  onReopenOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onPrintReceipt: (order: Order) => void;
}

export const SalesBook: React.FC<SalesBookProps> = ({
  orders,
  posConfig,
  onReopenOrder,
  onDeleteOrder,
  onPrintReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);
  const [printedSuccessId, setPrintedSuccessId] = useState<string | null>(null);

  const handlePrintClick = async (order: Order) => {
    setPrintingOrderId(order.id);

    // Automatic immediate print on click
    try {
      await onPrintReceipt(order);
      setPrintedSuccessId(order.id);
    } catch (e) {
      console.error('Erro ao imprimir comanda imediatamente:', e);
    } finally {
      setTimeout(() => {
        setPrintingOrderId(null);
      }, 600);
      setTimeout(() => {
        setPrintedSuccessId(null);
      }, 2500);
    }
  };

  const closedOrders = orders
    .filter((o) => o.status === 'finalizada_paga')
    .sort((a, b) => new Date(b.closedAt || b.updatedAt).getTime() - new Date(a.closedAt || a.updatedAt).getTime());

  const filtered = closedOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toString().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.tableOrType.toLowerCase().includes(q) ||
      (o.paymentMethod && o.paymentMethod.toLowerCase().includes(q))
    );
  });

  const totalSalesRevenue = closedOrders.reduce((sum, o) => sum + o.finalAmount, 0);

  const getPaymentBadge = (method?: string) => {
    switch (method) {
      case 'pix':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <QrCode className="w-3 h-3" /> PIX
          </span>
        );
      case 'cartao_credito':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
            <CreditCard className="w-3 h-3" /> Crédito
          </span>
        );
      case 'cartao_debito':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            <CreditCard className="w-3 h-3" /> Débito
          </span>
        );
      case 'dinheiro':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <Banknote className="w-3 h-3" /> Dinheiro
          </span>
        );
      default:
        return <span className="text-[11px] text-slate-400">Pago</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Livro de Vendas &middot; Histórico Fiscal
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {closedOrders.length} Vendas Registradas
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Consulte vendas concluídas, reabra comandas para edição, reimprima comprovantes POS-58 ou exclua com estorno.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Faturamento Total do Livro</span>
          <span className="text-xl font-black text-amber-400 font-mono">
            R$ {totalSalesRevenue.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Pesquisar por número de comanda, cliente, mesa ou forma de pagamento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Sales Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Nenhuma venda encontrada</p>
          <p className="text-xs text-slate-500">
            As comandas finalizadas no Caixa aparecerão automaticamente aqui.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Comanda</th>
                  <th className="py-3 px-4">Cliente / Mesa</th>
                  <th className="py-3 px-4">Horário Fechamento</th>
                  <th className="py-3 px-4">Forma Pagto</th>
                  <th className="py-3 px-4">Total Pago</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((order) => {
                  const isPrinting = printingOrderId === order.id;
                  const isPrinted = printedSuccessId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        #{order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200 block">{order.customerName}</span>
                        <span className="text-[11px] text-amber-400">{order.tableOrType}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {order.closedAt
                          ? new Date(order.closedAt).toLocaleString('pt-BR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '-'}
                      </td>
                      <td className="py-3.5 px-4">{getPaymentBadge(order.paymentMethod)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">
                        R$ {order.finalAmount.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* 1. Ver a Comanda */}
                          <button
                            onClick={() => setSelectedOrderForView(order)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Ver a Comanda"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. Imprimir Automático Imediato */}
                          <button
                            onClick={() => handlePrintClick(order)}
                            disabled={isPrinting}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                              isPrinted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 ring-1 ring-emerald-500/50'
                                : isPrinting
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                            }`}
                            title="Imprimir comanda de imediato na impressora MY-7779"
                          >
                            {isPrinting ? (
                              <Zap className="w-4 h-4 text-amber-400 animate-spin" />
                            ) : isPrinted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Printer className="w-4 h-4 text-amber-400" />
                            )}
                          </button>

                        {/* 3. Reabrir a Comanda */}
                        <button
                          onClick={() => onReopenOrder(order.id)}
                          className="p-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-colors"
                          title="Reabrir a Comanda (Estorna estoque e volta para ABERTA)"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* 4. Excluir */}
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors"
                          title="Excluir Comanda do Livro de Vendas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: VER A COMANDA & PREVIEW POS-58 */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Detalhes da Comanda #{selectedOrderForView.orderNumber}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedOrderForView.tableOrType} &middot; Cliente: {selectedOrderForView.customerName}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Thermal Receipt Visual Preview */}
              <ThermalReceipt order={selectedOrderForView} config={posConfig} previewOnly={true} />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <button
                onClick={() => {
                  onReopenOrder(selectedOrderForView.id);
                  setSelectedOrderForView(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reabrir Comanda</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const bytes = buildOrderEscPosBytes(selectedOrderForView, posConfig);
                    bluetoothPrinter.downloadEscPosFile(bytes, `comanda_${selectedOrderForView.orderNumber}_ios.bin`);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Baixar arquivo binário ESC/POS para iOS (.bin/.prn)"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <Apple className="w-3 h-3 text-slate-300" />
                  <span>Baixar p/ iOS</span>
                </button>

                <button
                  onClick={() => {
                    const text = generatePOS58ReceiptText(selectedOrderForView, posConfig);
                    bluetoothPrinter.shareReceipt(text, `Comanda #${selectedOrderForView.orderNumber} - Pastelaria Juh`);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Compartilhar cupom no WhatsApp / AirPrint / Apps Térmicos"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Compartilhar</span>
                </button>

                <button
                  onClick={() => handlePrintClick(selectedOrderForView)}
                  disabled={printingOrderId === selectedOrderForView.id}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {printingOrderId === selectedOrderForView.id ? (
                    <Zap className="w-4 h-4 text-slate-950 animate-spin" />
                  ) : printedSuccessId === selectedOrderForView.id ? (
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  ) : (
                    <Printer className="w-4 h-4" />
                  )}
                  <span>
                    {printingOrderId === selectedOrderForView.id
                      ? 'Imprimindo...'
                      : printedSuccessId === selectedOrderForView.id
                      ? 'Impresso com Sucesso!'
                      : 'Imprimir Automático MY-7779'}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedOrderForView(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Fechar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Excluir Comanda #{orderToDelete.orderNumber}?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você tem certeza que deseja excluir esta comanda do Livro de Vendas? O estoque dos ingredientes será automaticamente estornado.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
