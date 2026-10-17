import React, { useState } from 'react';
import {
  Receipt,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  Percent,
  Search,
  Copy,
  Check,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Download,
  Share2,
  Apple,
} from 'lucide-react';
import { Order, Product, POS58Config, ProductCategory } from '../types';
import { generatePixCopiaECola } from '../utils/pix';
import { bluetoothPrinter } from '../services/bluetoothPrinter';
import { buildOrderEscPosBytes, generatePOS58ReceiptText } from '../services/escpos';

interface CashierPDVProps {
  orders: Order[];
  products: Product[];
  posConfig: POS58Config;
  onCloseOrder: (params: {
    orderId: string;
    discount?: number;
    paymentMethod: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
    changeFor?: number;
  }) => Order | null;
  onAddItemToComanda: (orderId: string, item: { productId: string; name: string; price: number; quantity: number; category: ProductCategory }) => void;
  onRemoveItemFromComanda: (orderId: string, itemId: string) => void;
  onPrintReceipt: (order: Order) => void;
}

export const CashierPDV: React.FC<CashierPDVProps> = ({
  orders,
  products,
  posConfig,
  onCloseOrder,
  onAddItemToComanda,
  onRemoveItemFromComanda,
  onPrintReceipt,
}) => {
  const openOrders = orders.filter(
    (o) => o.status !== 'finalizada_paga' && o.status !== 'cancelada'
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    openOrders.length > 0 ? openOrders[0].id : null
  );

  // Payment Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro'>('pix');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isCopiedPix, setIsCopiedPix] = useState(false);
  const [cardProcessingState, setCardProcessingState] = useState<'idle' | 'processing' | 'approved'>('idle');

  // Add Item to Comanda Modal
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Selected Order Object
  const currentOrder = openOrders.find((o) => o.id === selectedOrderId) || openOrders[0] || null;

  // Calculate final amount with discount
  const orderSubtotal = currentOrder ? currentOrder.totalAmount : 0;
  const orderFinal = Math.max(0, orderSubtotal - discountAmount);

  // PIX Payload string
  const pixPayload = currentOrder
    ? generatePixCopiaECola({
        key: 'pastelariajuh1@gmail.com',
        name: 'PASTELARIA JUH',
        city: 'SAO PAULO',
        amount: orderFinal,
        txId: `COM${currentOrder.orderNumber}`,
      })
    : '';

  const handleCopyPix = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload);
      setIsCopiedPix(true);
      setTimeout(() => setIsCopiedPix(false), 2000);
    }
  };

  const handleSimulateCardPayment = () => {
    setCardProcessingState('processing');
    setTimeout(() => {
      setCardProcessingState('approved');
    }, 1200);
  };

  const handleConfirmPayment = () => {
    if (!currentOrder) return;

    const numCash = parseFloat(cashReceived.replace(',', '.')) || undefined;

    const completed = onCloseOrder({
      orderId: currentOrder.id,
      discount: discountAmount,
      paymentMethod,
      changeFor: paymentMethod === 'dinheiro' ? numCash : undefined,
    });

    if (completed && posConfig.autoPrintOnCheckout) {
      onPrintReceipt(completed);
    }

    setIsCheckoutOpen(false);
    setCardProcessingState('idle');
    setDiscountAmount(0);
    setCashReceived('');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Cashier Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Caixa &middot; Controle de Comandas Abertas (PDV)
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {openOrders.length} Abertas
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie mesas abertas, adicione itens extras, aplique descontos e finalize com Pix ou Cartão com baixa automática no estoque.
            </p>
          </div>
        </div>

        {currentOrder && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onPrintReceipt(currentOrder)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
              title="Imprimir comanda na impressora MY-7779 (58mm)"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir MY-7779 (58mm)</span>
            </button>

            <button
              onClick={() => {
                const text = generatePOS58ReceiptText(currentOrder, posConfig);
                bluetoothPrinter.downloadIOSFunction(text, posConfig.storeName);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Baixar função de impressão autônoma para iPhone / iPad (.html)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <Apple className="w-3 h-3 text-slate-300 -mr-0.5" />
              <span>Função iOS</span>
            </button>

            <button
              onClick={() => {
                const text = generatePOS58ReceiptText(currentOrder, posConfig);
                bluetoothPrinter.shareReceipt(text, `Comanda #${currentOrder.orderNumber} - Pastelaria Juh`);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Compartilhar cupom via WhatsApp / AirPrint / Apps Térmicos"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Compartilhar</span>
            </button>
          </div>
        )}
      </div>

      {openOrders.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <Receipt className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">Nenhuma comanda aberta</h3>
          <p className="text-xs text-slate-500">
            Todas as comandas foram encerradas e lançadas no Livro de Vendas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Comandas List */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Comandas Aguardando Fechamento ({openOrders.length})
            </span>

            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {openOrders.map((ord) => {
                const isSelected = currentOrder && currentOrder.id === ord.id;

                return (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      setDiscountAmount(0);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md ring-1 ring-amber-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-white">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                          {ord.tableOrType}
                        </span>
                      </div>

                      <span className="font-mono text-base font-extrabold text-amber-400">
                        R$ {ord.totalAmount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate max-w-[180px]">{ord.customerName}</span>
                      <span>{ord.items.length} item(ns)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Comanda Details & Checkout */}
          {currentOrder && (
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-extrabold text-white">
                      Comanda #{currentOrder.orderNumber}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold">
                      {currentOrder.tableOrType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Cliente: <span className="text-slate-200 font-medium">{currentOrder.customerName}</span>
                    {currentOrder.customerPhone && ` &middot; ${currentOrder.customerPhone}`}
                  </div>
                </div>

                {/* Add Item Button */}
                <button
                  onClick={() => setIsAddItemOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Adicionar Produto</span>
                </button>
              </div>

              {/* Items List in this Comanda */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Itens Consumidos</span>
                  <span>Ações</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-amber-400 w-5">
                          {item.quantity}x
                        </span>
                        <div>
                          <span className="font-semibold text-slate-200 block">{item.name}</span>
                          {item.notes && (
                            <span className="text-[11px] text-amber-400 italic block">
                              Obs: {item.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-200 font-bold">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          onClick={() => onRemoveItemFromComanda(currentOrder.id, item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Excluir este item da comanda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal & Discount row */}
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono text-slate-200 font-semibold">
                    R$ {orderSubtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-400" />
                    Desconto Especial (R$):
                  </span>
                  <div className="flex items-center gap-1 w-28">
                    <span className="text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={orderSubtotal}
                      value={discountAmount || ''}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-right text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm">
                  <span className="font-bold text-white">Total a Receber:</span>
                  <span className="font-mono font-extrabold text-amber-400 text-lg">
                    R$ {orderFinal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Action: Open Checkout / Payment Modal */}
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-colors cursor-pointer"
              >
                <CreditCard className="w-5 h-5" />
                <span>Receber Pagamento &amp; Fechar Comanda</span>
              </button>

            </div>
          )}

        </div>
      )}

      {/* MODAL 1: CHECKOUT & INTEGRATED PAYMENT (PIX / CARTAO / DINHEIRO) */}
      {isCheckoutOpen && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Recebimento de Pagamento &middot; Comanda #{currentOrder.orderNumber}
                </h3>
                <span className="text-xs text-slate-400">
                  {currentOrder.tableOrType} &middot; Cliente: {currentOrder.customerName}
                </span>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Total Display */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-300 font-semibold block">Valor Final com Desconto</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    R$ {orderFinal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 font-semibold">
                    Desconto: - R$ {discountAmount.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Selecione a Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'pix'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs font-bold">PIX Direto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cartao_credito');
                      setCardProcessingState('idle');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'cartao_credito'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-bold">Crédito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cartao_debito');
                      setCardProcessingState('idle');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'cartao_debito'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-bold">Débito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'dinheiro'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-xs font-bold">Dinheiro</span>
                  </button>
                </div>
              </div>

              {/* PIX SCREEN */}
              {paymentMethod === 'pix' && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center space-y-4">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-semibold text-slate-300 mb-2">
                      Aproxime a câmera do app do banco ou copie o código Pix:
                    </span>

                    {/* QR Code Canvas Representation */}
                    <div className="bg-white p-3 rounded-2xl shadow-md inline-block">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          pixPayload
                        )}`}
                        alt="QR Code Pix Pastelaria Juh"
                        className="w-40 h-40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixPayload}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-400 select-all"
                      />
                      <button
                        onClick={handleCopyPix}
                        className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {isCopiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{isCopiedPix ? 'Copiado!' : 'Copiar Pix'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Chave Pix: <span className="text-amber-400 font-mono">pastelariajuh1@gmail.com</span> &middot; Beneficiário: <span className="text-slate-200">Pastelaria Juh</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARTÃO SCREEN */}
              {(paymentMethod === 'cartao_credito' || paymentMethod === 'cartao_debito') && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
                  <CreditCard className="w-12 h-12 text-sky-400 mx-auto" />
                  
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Terminal de Pagamento &middot; {paymentMethod === 'cartao_credito' ? 'Crédito' : 'Débito'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Insira, aproxime ou passe o cartão do cliente na máquina POS integrada.
                    </p>
                  </div>

                  {cardProcessingState === 'idle' && (
                    <button
                      onClick={handleSimulateCardPayment}
                      className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Aguardar Aprovação do Cartão
                    </button>
                  )}

                  {cardProcessingState === 'processing' && (
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processando autorização na maquininha...</span>
                    </div>
                  )}

                  {cardProcessingState === 'approved' && (
                    <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Transação Autorizada com Sucesso! NSU: 894102</span>
                    </div>
                  )}
                </div>
              )}

              {/* DINHEIRO SCREEN */}
              {paymentMethod === 'dinheiro' && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Valor Recebido em Dinheiro (R$)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 50,00 ou 100,00"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-base text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {(() => {
                    const received = parseFloat(cashReceived.replace(',', '.')) || 0;
                    const change = Math.max(0, received - orderFinal);
                    return (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Troco a devolver:</span>
                        <span
                          className={`font-mono text-base font-extrabold ${
                            change > 0 ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          R$ {change.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Voltar
              </button>

              <button
                onClick={handleConfirmPayment}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pagamento &amp; Dar Baixa no Estoque</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: ADD EXTRA ITEM TO OPEN COMANDA */}
      {isAddItemOpen && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Lançar Produto Extra na Comanda #{currentOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar produto para lançar..."
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {products
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                      p.category.toLowerCase().includes(itemSearchQuery.toLowerCase())
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{p.name}</span>
                        <span className="text-[11px] text-amber-400 font-mono">
                          R$ {p.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onAddItemToComanda(currentOrder.id, {
                            productId: p.id,
                            name: p.name,
                            price: p.price,
                            quantity: 1,
                            category: p.category,
                          });
                          setIsAddItemOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Lançar</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
