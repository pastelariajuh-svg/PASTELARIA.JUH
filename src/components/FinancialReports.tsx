import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  Calendar,
  FileSpreadsheet,
  PieChart,
  Award,
} from 'lucide-react';
import { db } from '../services/db';

export const FinancialReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'mes_atual' | 'hoje'>('mes_atual');
  const summary = db.getFinancialSummary();

  const paymentTotals = summary.paymentMethodsSummary;
  const totalPayAmount =
    paymentTotals.pix.total +
    paymentTotals.cartao_credito.total +
    paymentTotals.cartao_debito.total +
    paymentTotals.dinheiro.total || 1;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Relatórios Financeiros &middot; DRE da Pastelaria
            </h2>
            <p className="text-xs text-slate-400">
              Demonstrativo de faturamento mensal, custo dos insumos (CMV), margens e divisão de meios de pagamento.
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setSelectedPeriod('hoje')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedPeriod === 'hoje'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setSelectedPeriod('mes_atual')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedPeriod === 'mes_atual'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mês Corrente (Outubro 2026)
          </button>
        </div>
      </div>

      {/* KPI 4-Card Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Faturamento Bruto */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400 block">Receita Bruta Total</span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            R$ {summary.totalRevenue.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium block">
            {summary.totalOrdersCount} comandas faturadas
          </span>
        </div>

        {/* Card 2: Custo dos Insumos (CMV) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400 block">Custo dos Insumos (CMV)</span>
          <div className="text-2xl font-black text-slate-200 font-mono">
            R$ {summary.totalIngredientCost.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-slate-400 block">
            Baseado nas fichas técnicas
          </span>
        </div>

        {/* Card 3: Lucro Bruto */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400 block">Lucro Bruto Operacional</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            R$ {summary.grossProfit.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-emerald-400/90 font-medium block">
            Margem Bruta: {summary.grossMarginPercent.toFixed(1)}%
          </span>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400 block">Ticket Médio por Comanda</span>
          <div className="text-2xl font-black text-sky-400 font-mono">
            R$ {summary.averageTicket.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-slate-400 block">
            Média de consumo por mesa/balcão
          </span>
        </div>

      </div>

      {/* DRE SIMPLIFICADO & PAGAMENTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* DRE Simplificado Box (Col 7) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Demonstrativo do Resultado (DRE Mensal)
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-300 font-semibold">(+) Receita Bruta de Vendas</span>
              <span className="font-mono font-bold text-white">
                R$ {summary.totalRevenue.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">(-) Descontos Concedidos no Caixa</span>
              <span className="font-mono text-rose-400">
                - R$ {summary.totalDiscounts.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 bg-slate-950/40 px-2 rounded-lg font-semibold">
              <span className="text-amber-300">(=) Receita Líquida</span>
              <span className="font-mono text-amber-400 font-bold">
                R$ {(summary.totalRevenue - summary.totalDiscounts).toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">(-) Custo da Matéria Prima Consumida (CMV Fichas Técnicas)</span>
              <span className="font-mono text-rose-400">
                - R$ {summary.totalIngredientCost.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 pb-1 text-sm bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 font-bold">
              <span className="text-emerald-300">(=) Lucro Operacional Bruto</span>
              <span className="font-mono text-emerald-400 text-base">
                R$ {summary.grossProfit.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>

        {/* Meios de Pagamento Box (Col 5) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <PieChart className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Formas de Pagamento</h3>
          </div>

          <div className="space-y-3">
            {/* PIX */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" /> PIX Instantâneo
                </span>
                <span className="font-mono font-bold text-white">
                  R$ {paymentTotals.pix.total.toFixed(2).replace('.', ',')} ({paymentTotals.pix.count})
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${(paymentTotals.pix.total / totalPayAmount) * 100}%` }}
                />
              </div>
            </div>

            {/* Cartão Crédito */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-sky-400" /> Cartão de Crédito
                </span>
                <span className="font-mono font-bold text-white">
                  R$ {paymentTotals.cartao_credito.total.toFixed(2).replace('.', ',')} ({paymentTotals.cartao_credito.count})
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all"
                  style={{ width: `${(paymentTotals.cartao_credito.total / totalPayAmount) * 100}%` }}
                />
              </div>
            </div>

            {/* Cartão Débito */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-400" /> Cartão de Débito
                </span>
                <span className="font-mono font-bold text-white">
                  R$ {paymentTotals.cartao_debito.total.toFixed(2).replace('.', ',')} ({paymentTotals.cartao_debito.count})
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${(paymentTotals.cartao_debito.total / totalPayAmount) * 100}%` }}
                />
              </div>
            </div>

            {/* Dinheiro */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-amber-400" /> Dinheiro em Espécie
                </span>
                <span className="font-mono font-bold text-white">
                  R$ {paymentTotals.dinheiro.total.toFixed(2).replace('.', ',')} ({paymentTotals.dinheiro.count})
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(paymentTotals.dinheiro.total / totalPayAmount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Top Selling Products */}
      {summary.topSellingProducts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Produtos Mais Vendidos na Pastelaria</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {summary.topSellingProducts.map((p, idx) => (
              <div key={idx} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 block font-mono">
                  #{idx + 1} Campeão
                </span>
                <span className="text-xs font-bold text-white block leading-snug truncate">
                  {p.name}
                </span>
                <div className="text-xs text-slate-400 pt-1 flex justify-between">
                  <span>{p.quantity} un vendidas</span>
                  <span className="text-amber-400 font-mono font-bold">
                    R$ {p.revenue.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
