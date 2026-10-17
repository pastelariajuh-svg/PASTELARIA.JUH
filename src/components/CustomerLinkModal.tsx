import React, { useState, useEffect } from 'react';
import {
  X,
  Link as LinkIcon,
  Copy,
  Check,
  QrCode,
  Share2,
  ExternalLink,
  MessageCircle,
  Smartphone,
  Sparkles,
  MapPin,
  Eye,
  Settings2,
  Globe,
  Info,
  Layers,
} from 'lucide-react';

interface CustomerLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable?: string;
  onEnterCustomerMode?: (table?: string) => void;
}

const TABLE_OPTIONS = [
  { id: '', label: 'Geral (O cliente escolhe a mesa ou balcão)' },
  { id: 'Mesa 01', label: 'Mesa 01' },
  { id: 'Mesa 02', label: 'Mesa 02' },
  { id: 'Mesa 03', label: 'Mesa 03' },
  { id: 'Mesa 04', label: 'Mesa 04' },
  { id: 'Mesa 05', label: 'Mesa 05' },
  { id: 'Mesa 06', label: 'Mesa 06' },
  { id: 'Mesa 07', label: 'Mesa 07' },
  { id: 'Mesa 08', label: 'Mesa 08' },
  { id: 'Mesa 09', label: 'Mesa 09' },
  { id: 'Mesa 10', label: 'Mesa 10' },
  { id: 'Balcão', label: 'Balcão' },
  { id: 'Viagem', label: 'Para Levar / Viagem' },
];

export const CustomerLinkModal: React.FC<CustomerLinkModalProps> = ({
  isOpen,
  onClose,
  currentTable,
  onEnterCustomerMode,
}) => {
  const [selectedTable, setSelectedTable] = useState<string>(currentTable || '');
  const [copied, setCopied] = useState(false);
  const [urlFormat, setUrlFormat] = useState<'hash' | 'query'>('query');
  const [customBaseUrl, setCustomBaseUrl] = useState<string>('');
  const [isEditingBase, setIsEditingBase] = useState(false);

  // Auto-detect base URL (defaults to current window origin so it works immediately)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const path = window.location.pathname === '/' ? '' : window.location.pathname;
      setCustomBaseUrl(`${origin}${path}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build the dedicated customer-only URL
  const getCustomerUrl = () => {
    const base = customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const cleanBase = base.replace(/\/+$/, '');

    const tableParam = selectedTable ? `mesa=${encodeURIComponent(selectedTable)}` : '';

    if (urlFormat === 'hash') {
      // Universal Hash Routing (100% resilient across any web host, static host, or subfolder)
      const queryPart = tableParam ? `?${tableParam}` : '';
      return `${cleanBase}/#cardapio${queryPart}`;
    } else {
      // Standard Query String
      const params = new URLSearchParams();
      params.set('modo', 'cardapio');
      if (selectedTable) {
        params.set('mesa', selectedTable);
      }
      return `${cleanBase}/?${params.toString()}`;
    }
  };

  const customerUrl = getCustomerUrl();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    customerUrl
  )}`;

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(customerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const tableMsg = selectedTable ? ` para a ${selectedTable}` : '';
    const text = `🥟 *Pastelaria Juh - Cardápio Digital*\nOlá! Faça seu pedido direto pela comanda${tableMsg} no link:\n${customerUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
  };

  const handleTestInApp = () => {
    if (onEnterCustomerMode) {
      onEnterCustomerMode(selectedTable || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Link do Cardápio para Clientes
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Visão Exclusiva
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                O cliente abre somente o cardápio, monta a comanda e envia sem ver painéis administrativos.
              </p>
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

          {/* Condição de Ativação Imediata (100% à prova de erro) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Condição para Funcionar Imediatamente:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Ative a condição do cardápio diretamente no sistema. Os painéis administrativos (Cozinha, Caixa, Estoque) são ocultados e a comanda do cliente abre na hora pronta para pedir!
              </p>
            </div>
            <button
              onClick={handleTestInApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md shadow-emerald-500/20 whitespace-nowrap"
            >
              <Smartphone className="w-4 h-4" />
              <span>Ativar Condição Agora</span>
            </button>
          </div>

          {/* Table Binding Option */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Vincular Link a uma Mesa Específica (Opcional):</span>
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {TABLE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Se selecionar uma mesa (ex: Mesa 02), ao abrir o link a comanda do cliente já abre vinculada à mesa.
            </p>
          </div>

          {/* URL Format Switcher */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Link Exclusivo do Cardápio:</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setUrlFormat('query')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    urlFormat === 'query'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Padrão (?modo=cardapio)
                </button>
                <button
                  type="button"
                  onClick={() => setUrlFormat('hash')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    urlFormat === 'hash'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Formato compatível com 100% dos servidores e roteamentos estáticos"
                >
                  Universal (#cardapio)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={customerUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* Custom domain / base URL config */}
            <div className="pt-1">
              {!isEditingBase ? (
                <button
                  type="button"
                  onClick={() => setIsEditingBase(true)}
                  className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>Ajustar domínio base do link (ex: site próprio ou IP local)</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-amber-400" />
                      Domínio Base do Link:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingBase(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Salvar
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    placeholder="https://minhapastelaria.com.br ou https://seu-link-publico.run.app"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          setCustomBaseUrl(window.location.origin);
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 transition-colors"
                    >
                      Usar Link Atual (Dev)
                    </button>
                    {typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomBaseUrl(window.location.origin.replace('ais-dev-', 'ais-pre-'));
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-[10px] text-emerald-300 transition-colors"
                      >
                        Usar Link Público (Share)
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    O link e o QR Code serão gerados exatamente com este endereço para os clientes.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Card for Table Stands */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-lg shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code do Cardápio Digital"
                className="w-28 h-28 object-contain"
                loading="lazy"
              />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>QR Code para Mesas &amp; Display</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Imprima este QR Code ou coloque no display acrílico das mesas. O cliente aponta a câmera do celular e o cardápio abre na hora sem instalar nada!
              </p>
              <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                <a
                  href={qrCodeUrl}
                  download="qrcode_cardapio_pastelaria_juh.png"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Baixar Imagem do QR Code</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Share Strip */}
          <div className="pt-1">
            <button
              onClick={handleShareWhatsApp}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Cardápio via WhatsApp</span>
            </button>
          </div>

          {/* Security & Access Info */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-300">Privacidade &amp; Segurança:</span>
              Neste link exclusivo, o cliente só enxerga o cardápio digital e a sua própria comanda. Cozinha (KDS), Caixa (PDV), Estoque e Livro de Vendas ficam 100% ocultos e protegidos por senha.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <button
            onClick={handleTestInApp}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Testar no sistema</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
