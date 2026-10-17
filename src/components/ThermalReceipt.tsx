import React from 'react';
import { Order, POS58Config } from '../types';
import { generatePOS58ReceiptText } from '../services/escpos';

interface ThermalReceiptProps {
  order: Order | null;
  config: POS58Config;
  previewOnly?: boolean;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ order, config, previewOnly = false }) => {
  if (!order) return null;

  const receiptText = generatePOS58ReceiptText(order, config);

  if (previewOnly) {
    return (
      <div className="bg-amber-50 text-slate-900 p-4 rounded-xl border border-amber-200/60 shadow-inner font-mono text-[12px] leading-relaxed max-w-[340px] mx-auto select-all overflow-x-auto whitespace-pre">
        {receiptText}
      </div>
    );
  }

  return (
    <div
      id="thermal-print-area"
      className="hidden print:block whitespace-pre font-mono"
      style={{ display: 'none' }}
      aria-hidden="true"
    >
      {receiptText}
    </div>
  );
};
