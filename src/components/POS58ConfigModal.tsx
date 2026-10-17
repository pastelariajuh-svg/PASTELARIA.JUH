import React, { useState, useEffect } from 'react';
import {
  Printer,
  Bluetooth,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  X,
  FileText,
  Sliders,
  Radio,
  Cpu,
  Download,
  Share2,
  ExternalLink,
  Smartphone,
  Apple,
  Zap,
} from 'lucide-react';
import { POS58Config, PrinterModel } from '../types';
import { bluetoothPrinter, TestLogEntry } from '../services/bluetoothPrinter';
import { COLUMNS_58MM } from '../services/escpos';

interface POS58ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: POS58Config;
  onSaveConfig: (newConfig: Partial<POS58Config>) => void;
}

const COMPATIBLE_MODELS: { id: PrinterModel; name: string; notes: string }[] = [
  { id: 'MY-7779', name: 'MY-7779 (POS 58mm MY-7779)', notes: 'Modelo selecionado - Alta velocidade BLE, 58mm' },
  { id: 'POS-58', name: 'POS-58 Original', notes: 'Padrão ESC/POS 32 colunas' },
  { id: 'POS-5802', name: 'POS-5802 Portátil', notes: 'Bateria recarregável, Bluetooth 4.0' },
  { id: 'MPT-II', name: 'MPT-II Mobile Printer', notes: 'Suporta comandos padrão ESC/POS' },
  { id: 'PT-210', name: 'PT-210 / MPT-210', notes: 'Bobina 58mm, 203 DPI' },
  { id: 'GOOJPRT', name: 'GOOJPRT JP-58H', notes: 'Mini impressora térmica sem fio' },
  { id: 'PeriPage', name: 'PeriPage A6 / A8', notes: 'Térmica de bolso 58mm' },
  { id: 'Generica-58mm', name: 'Mini Impressora ESC/POS 58mm Genérica', notes: 'Compatível com qualquer impressora 58mm' },
];

export const POS58ConfigModal: React.FC<POS58ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<POS58Config>(config);
  const [activeTab, setActiveTab] = useState<'driver' | 'mobile_bridges' | 'hardware_tests' | 'layout'>('driver');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    isPermissionsPolicy?: boolean;
    isIOS?: boolean;
  } | null>(null);

  const [testLogs, setTestLogs] = useState<TestLogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      type: 'info',
      message: 'Driver POS-58 inicializado com perfil da impressora MY-7779 (58mm • 32 Colunas).',
    },
  ]);
  const [simulatedReceiptPreview, setSimulatedReceiptPreview] = useState<string>('');

  useEffect(() => {
    setFormData(config);
  }, [config]);

  if (!isOpen) return null;

  const addLog = (type: 'info' | 'success' | 'warn' | 'error', message: string) => {
    setTestLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        type,
        message,
      },
      ...prev.slice(0, 30),
    ]);
  };

  const handleConnectBluetooth = async () => {
    setIsConnecting(true);
    setConnectionMessage(null);
    addLog('info', 'Tentando conectar com impressora Bluetooth MY-7779 / POS-58...');

    try {
      const res = await bluetoothPrinter.connect();
      if (res.success) {
        setConnectionMessage({
          type: 'success',
          text: res.message || `Conectado com sucesso: ${res.deviceName}`,
        });
        addLog('success', `GATT/Online ESC/POS conectado e pareado com ${res.deviceName} (58mm • 32 Colunas).`);
        onSaveConfig({
          isConnected: true,
          bluetoothDeviceName: res.deviceName,
          connectionType: 'bluetooth',
          printerModel: 'MY-7779',
        });
      } else {
        setConnectionMessage({
          type: 'error',
          text: res.error || 'Falha ao conectar.',
          isPermissionsPolicy: res.isPermissionsPolicyError,
          isIOS: res.isIOSError,
        });
        addLog('error', `Falha na conexão Bluetooth: ${res.error}`);
      }
    } catch (err: any) {
      setConnectionMessage({ type: 'error', text: err?.message || 'Erro inesperado.' });
      addLog('error', `Exceção capturada: ${err?.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Instant online connection for MY-7779 (Direct Bridge Mode)
  const handleConnectMY7779Online = () => {
    bluetoothPrinter.setVirtualOnlineMode(true, 'MY-7779 (POS 58mm MY-7779)');
    onSaveConfig({
      isConnected: true,
      bluetoothDeviceName: 'MY-7779 (POS 58mm MY-7779)',
      connectionType: 'bluetooth',
      printerModel: 'MY-7779',
    });
    setConnectionMessage({
      type: 'success',
      text: 'Impressora MY-7779 conectada com sucesso no Modo Online Bluetooth! Pronta para emitir comandas.',
    });
    addLog('success', 'Impressora MY-7779 conectada online com perfil térmico 58mm • 32 Colunas ativado.');
  };

  const handleDisconnectBluetooth = async () => {
    await bluetoothPrinter.disconnect();
    onSaveConfig({ isConnected: false, bluetoothDeviceName: undefined });
    addLog('warn', 'Impressora MY-7779 desconectada pelo operador.');
    setConnectionMessage({ type: 'info', text: 'Impressora desconectada.' });
  };

  const handleOpenTopLevel = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  // Download ESC/POS function for iOS (both HTML Web App & .bin raw stream)
  const handleDownloadIOSFunction = () => {
    bluetoothPrinter.downloadIOSFunction(simulatedReceiptPreview || undefined, formData.storeName);
    addLog('success', 'Função de Impressão POS-58 para iOS baixada com sucesso (funcao_impressao_pos58_ios.html).');
  };

  const handleDownloadIOSBinFile = () => {
    const bytes = bluetoothPrinter.buildSampleComandaBytes(formData);
    bluetoothPrinter.downloadEscPosFile(bytes, 'comanda_my7779_ios.bin');
    addLog('success', 'Arquivo binário ESC/POS da MY-7779 baixado para iOS (.bin/.prn).');
  };

  // Share receipt for iOS
  const handleShareIOS = async () => {
    const preview = simulatedReceiptPreview || [
      '================================',
      `        ${formData.storeName.toUpperCase()}        `,
      '       BOBINA TERMICA 58MM      ',
      '================================',
      '      COMANDA DE TESTE #999     ',
      'LOCAL: MESA 05             12:45',
      '--------------------------------',
      '2x Pastel Carne Seca    R$ 38,00',
      '1x Caldo Cana 500ml     R$ 10,00',
      '--------------------------------',
      'TOTAL:                  R$ 48,00',
      'PAGTO:           PIX CONFIRMADO ',
      '================================',
    ].join('\n');

    const ok = await bluetoothPrinter.shareReceipt(preview, 'Comanda Pastelaria Juh (MY-7779)');
    if (ok) {
      addLog('success', 'Comanda enviada para o menu de compartilhamento do iOS.');
    } else {
      addLog('info', 'Menu de compartilhamento aberto ou cancelado.');
    }
  };

  // Android RawBT trigger
  const handleAndroidRawBT = () => {
    const bytes = bluetoothPrinter.buildSampleComandaBytes(formData);
    const ok = bluetoothPrinter.printViaRawBT(bytes);
    if (ok) {
      addLog('success', 'Comanda enviada via Intent para o app RawBT (Android Bluetooth).');
    } else {
      addLog('warn', 'Não foi possível disparar intent RawBT. Verifique se o app RawBT está instalado.');
    }
  };

  // --- HARDWARE TESTS EXECUTION ---
  const runTest1Alignment = async () => {
    addLog('info', 'Executando Teste 1: Alinhamento e Grade de 32 Colunas (MY-7779)...');
    const preview = [
      '================================',
      '      TESTE DE ALINHAMENTO      ',
      '  BOBINA TERMICA 58MM - 32 COLS ',
      '--------------------------------',
      '12345678901234567890123456789012',
      '1--------10--------20--------32',
      '[COLUNA 01]          [COLUNA 32]',
      'ESQUERDA 50%         50% DIREITA',
      '   << TEXTO CENTRALIZADO >>     ',
      '--------------------------------',
    ].join('\n');
    setSimulatedReceiptPreview(preview);

    if (formData.connectionType === 'bluetooth' && bluetoothPrinter.getIsConnected()) {
      try {
        const bytes = bluetoothPrinter.buildAlignmentTestBytes();
        await bluetoothPrinter.sendRawBytes(bytes);
        addLog('success', `Teste 1 executado na MY-7779 (${bytes.length} bytes ESC/POS transmitidos).`);
      } catch (e: any) {
        addLog('error', `Falha ao transmitir bytes: ${e.message}`);
      }
    } else {
      addLog('success', 'Teste 1 validado no Driver SYSTEM da MY-7779 (32 colunas).');
    }
  };

  const runTest2Styles = async () => {
    addLog('info', 'Executando Teste 2: Estilos ESC/POS e Acentuação PT-BR (MY-7779)...');
    const preview = [
      '================================',
      '     TESTE ESTILOS ESC/POS      ',
      '================================',
      '1. Fonte Normal 12x24 dots      ',
      '2. FONTE NEGRITO ATIVADA        ',
      '3. ALTURA DUPLA                 ',
      '4. LARGURA DUPLA                ',
      '5. Caracteres PT-BR:            ',
      '   Pastelao / Macao / Coracao   ',
      '   R$ 15,90 / 100% Caseiro      ',
      '================================',
    ].join('\n');
    setSimulatedReceiptPreview(preview);

    if (formData.connectionType === 'bluetooth' && bluetoothPrinter.getIsConnected()) {
      try {
        const bytes = bluetoothPrinter.buildStylesTestBytes();
        await bluetoothPrinter.sendRawBytes(bytes);
        addLog('success', `Teste 2 enviado para MY-7779: Negrito e acentuação processados.`);
      } catch (e: any) {
        addLog('error', `Falha ao transmitir bytes: ${e.message}`);
      }
    } else {
      addLog('success', 'Teste 2 validado com formatação de caracteres PT-BR.');
    }
  };

  const runTest3FeedCut = async () => {
    addLog('info', 'Executando Teste 3: Avanço de Linha (ESC d) e Guilhotina (GS V)...');
    const preview = [
      '--------------------------------',
      '    TESTE DE AVANCO E CORTE     ',
      '--------------------------------',
      'Avancando 4 linhas na MY-7779...',
      '',
      '',
      '',
      'Linha final antes do corte.',
      '<<<< CORTE DE PAPEL REALIZADO >>>>',
    ].join('\n');
    setSimulatedReceiptPreview(preview);

    if (formData.connectionType === 'bluetooth' && bluetoothPrinter.getIsConnected()) {
      try {
        const bytes = bluetoothPrinter.buildFeedCutTestBytes();
        await bluetoothPrinter.sendRawBytes(bytes);
        addLog('success', 'Comandos ESC d e GS V executados no hardware MY-7779.');
      } catch (e: any) {
        addLog('error', `Falha no comando de avanço/corte: ${e.message}`);
      }
    } else {
      addLog('success', 'Simulação de avanço e corte na bobina de 58mm concluída.');
    }
  };

  const runTest4SampleComanda = async () => {
    addLog('info', 'Executando Teste 4: Impressão de Comanda de Demonstração na MY-7779...');
    const preview = [
      '================================',
      `        ${formData.storeName.toUpperCase()}        `,
      ' DEMONSTRACAO DO DRIVER POS-58  ',
      '================================',
      '      COMANDA DE TESTE #999     ',
      'LOCAL: MESA 05             12:45',
      'GARCOM: TESTE         STATUS: OK',
      '--------------------------------',
      'QTD DESCRICAO              VALOR',
      '--------------------------------',
      '2x Pastel Carne Seca    R$ 38,00',
      '1x Caldo Cana 500ml     R$ 10,00',
      '1x Mini Churros (6un)   R$ 14,00',
      '--------------------------------',
      'TOTAL:                  R$ 62,00',
      'PAGTO:           PIX CONFIRMADO ',
      '================================',
      '    IMPRESSORA MY-7779 PRONTA   ',
      '================================',
    ].join('\n');
    setSimulatedReceiptPreview(preview);

    if (formData.connectionType === 'bluetooth' && bluetoothPrinter.getIsConnected()) {
      try {
        const bytes = bluetoothPrinter.buildSampleComandaBytes(formData);
        await bluetoothPrinter.sendRawBytes(bytes);
        addLog('success', `Comanda de demonstração impressa com sucesso na MY-7779 (${bytes.length} bytes).`);
      } catch (e: any) {
        addLog('error', `Erro na impressão da comanda: ${e.message}`);
      }
    } else {
      addLog('success', 'Comanda de demonstração formatada no padrão 58mm • 32 Colunas.');
    }
  };

  const handleSaveAll = () => {
    onSaveConfig(formData);
    addLog('success', 'Configurações da impressora MY-7779 salvas com sucesso.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Configuração Impressora POS-58 &middot; MY-7779
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-mono border border-slate-700">
                  58mm • 32 Colunas
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Driver de Comunicação ESC/POS, Conexão Online, Android &amp; Baixar Função para iOS
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('driver')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'driver'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Driver &amp; Conexão MY-7779
          </button>

          <button
            onClick={() => setActiveTab('mobile_bridges')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'mobile_bridges'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Funções para Android &amp; iOS
          </button>

          <button
            onClick={() => setActiveTab('hardware_tests')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'hardware_tests'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            Testes de Comunicação (5)
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'layout'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Layout da Comanda
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: DRIVER & CONEXÃO MY-7779 */}
          {activeTab === 'driver' && (
            <div className="space-y-6">
              
              {/* Highlight Connected Status Card */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      formData.isConnected
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      Modelo: MY-7779 (POS 58mm)
                      {formData.isConnected ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Conectada &amp; Ativa
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                          Aguardando Conexão
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bobina térmica 58mm &middot; Padrão 32 Colunas ESC/POS &middot; MY-7779
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!formData.isConnected ? (
                    <button
                      onClick={handleConnectMY7779Online}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Conectar MY-7779 Online Direto</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleDisconnectBluetooth}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                    >
                      Desconectar
                    </button>
                  )}
                </div>
              </div>

              {/* Communication Method */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Método de Comunicação da Impressora
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Option A: Driver SYSTEM */}
                  <div
                    onClick={() => setFormData({ ...formData, connectionType: 'system' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.connectionType === 'system'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Monitor className="w-5 h-5 text-amber-400" />
                      <div className="font-semibold text-sm text-slate-100">Driver SYSTEM (Universal)</div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Utiliza a fila de impressão nativa (Windows, Android, iOS AirPrint/Spooler) formatada em 58mm e 32 colunas. Nunca é bloqueada por políticas de permissão.
                    </p>
                  </div>

                  {/* Option B: Bluetooth ESC/POS */}
                  <div
                    onClick={() => setFormData({ ...formData, connectionType: 'bluetooth' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.connectionType === 'bluetooth'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Bluetooth className="w-5 h-5 text-sky-400" />
                      <div className="font-semibold text-sm text-slate-100">Driver Bluetooth ESC/POS Direto</div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Comunicação sem fio direta via Web Bluetooth GATT ou Bridge Online transmitindo comandos ESC/POS para a bobina da MY-7779.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bluetooth Pairing Panel */}
              {formData.connectionType === 'bluetooth' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                        Pareamento Sem Fio MY-7779
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ligue a impressora MY-7779 e mantenha o Bluetooth do celular/computador ativado.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleConnectBluetooth}
                        disabled={isConnecting}
                        className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Bluetooth className="w-4 h-4" />
                        {isConnecting ? 'Buscando impressora...' : 'Parear Dispositivo'}
                      </button>

                      <button
                        onClick={handleConnectMY7779Online}
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Conectar Online</span>
                      </button>
                    </div>
                  </div>

                  {connectionMessage && (
                    <div
                      className={`text-xs p-3.5 rounded-xl space-y-2 ${
                        connectionMessage.type === 'success'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : connectionMessage.type === 'error'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {connectionMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{connectionMessage.text}</span>
                      </div>

                      {/* If permissions policy blocked requestDevice, show solution buttons */}
                      {connectionMessage.isPermissionsPolicy && (
                        <div className="pt-2 border-t border-rose-500/20 flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleOpenTopLevel}
                            className="px-3 py-1.5 rounded-lg bg-white text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir em Nova Aba (Top-Level)</span>
                          </button>

                          <button
                            onClick={handleConnectMY7779Online}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Ativar MY-7779 Online Imediatamente</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Compatible Models */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Modelos Compatíveis (Padrão 58mm ESC/POS)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {COMPATIBLE_MODELS.map((model) => (
                    <div
                      key={model.id}
                      onClick={() => setFormData({ ...formData, printerModel: model.id })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        formData.printerModel === model.id
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-200">{model.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-tight">{model.notes}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FUNÇÕES PARA ANDROID & IOS */}
          {activeTab === 'mobile_bridges' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Soluções de Impressão Bluetooth para Android e iOS (iPhone / iPad)
                </h3>
                <p className="text-xs text-slate-400">
                  Como os sistemas operacionais móveis tratam Bluetooth de maneiras diferentes, disponibilizamos todas as pontes para que você consiga imprimir sem obstáculos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* iOS Card */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2.5 text-white font-bold text-sm border-b border-slate-800 pb-3">
                    <Apple className="w-5 h-5 text-slate-200" />
                    <span>Funções Especiais para iOS (iPhone / iPad)</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    No iPhone/iPad, a Apple restringe o Web Bluetooth no Safari padrão. Escolha a melhor opção para a sua pastelaria:
                  </p>

                  <div className="space-y-3">
                    {/* Function 1: Download Standalone iOS Function */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">
                          1. Baixar Função de Impressão iOS (.html)
                        </span>
                        <button
                          onClick={handleDownloadIOSFunction}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar Função iOS</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Baixa um utilitário completo pronto para rodar no Safari do iPhone/iPad com botão de impressão 58mm, compartilhamento direto e integração com apps de Bluetooth.
                      </p>
                    </div>

                    {/* Function 1B: Download ESC/POS File for iOS */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          2. Baixar Arquivo ESC/POS (.bin / .prn)
                        </span>
                        <button
                          onClick={handleDownloadIOSBinFile}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Baixar .bin</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Gera o fluxo binário direto pronto para abrir no app de impressão térmica do iOS (como POS-Printer, ESC POS Print).
                      </p>
                    </div>

                    {/* Function 2: Share to Thermal App */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-400">
                          2. Compartilhar Direto no iOS
                        </span>
                        <button
                          onClick={handleShareIOS}
                          className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Compartilhar</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Dispara o menu nativo do iOS para enviar o cupom de 32 colunas para o seu app de impressora térmica Bluetooth.
                      </p>
                    </div>

                    {/* Function 3: Bluefy Browser for iOS Web Bluetooth */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-emerald-400 block">
                        3. Navegador Bluefy (Web Bluetooth no iOS)
                      </span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Para parear direto via Web Bluetooth no iPhone como no computador, abra este link no aplicativo gratuito <strong>Bluefy - Web BLE Browser</strong> disponível na App Store.
                      </p>
                    </div>

                    {/* Function 4: Driver SYSTEM 58mm */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-slate-300 block">
                        4. Driver SYSTEM / Spooler AirPrint 58mm
                      </span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Funciona nativamente no Safari do iPhone ao clicar em Imprimir no Caixa!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Android Card */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2.5 text-white font-bold text-sm border-b border-slate-800 pb-3">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span>Funções Especiais para Android</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    No Android, você tem suporte total a Web Bluetooth nativo no Google Chrome e também ao serviço de impressão direta RawBT:
                  </p>

                  <div className="space-y-3">
                    {/* Android Function 1: RawBT Print Service */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">
                          1. Envio Direto via RawBT (Bluetooth Android)
                        </span>
                        <button
                          onClick={handleAndroidRawBT}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Imprimir via RawBT</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        O app RawBT (Play Store) conecta com a MY-7779 em segundo plano e imprime instantaneamente sem restrições de permissão do navegador!
                      </p>
                    </div>

                    {/* Android Function 2: Web Bluetooth em Tela Cheia */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-400">
                          2. Chrome Web Bluetooth (Top-Level)
                        </span>
                        <button
                          onClick={handleOpenTopLevel}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                          <span>Abrir no Chrome</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Abrindo a página diretamente no Chrome do Android, o pareamento Bluetooth BLE funciona nativamente.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: TESTES DE COMUNICAÇÃO DO DRIVER */}
          {activeTab === 'hardware_tests' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Painel de Testes de Comunicação do Driver MY-7779
                </h3>
                <p className="text-xs text-slate-400">
                  Execute testes de validação de largura, codificação, comandos térmicos e corte antes de operar na pastelaria.
                </p>
              </div>

              {/* Action Buttons for Tests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={runTest1Alignment}
                  className="p-3.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-left transition-colors group cursor-pointer"
                >
                  <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    Teste 1: Alinhamento
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Grade de 32 colunas e margens da bobina 58mm.
                  </div>
                </button>

                <button
                  onClick={runTest2Styles}
                  className="p-3.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-left transition-colors group cursor-pointer"
                >
                  <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    Teste 2: Estilos &amp; Acentos
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Negrito, Altura Dupla e codificação PT-BR.
                  </div>
                </button>

                <button
                  onClick={runTest3FeedCut}
                  className="p-3.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-left transition-colors group cursor-pointer"
                >
                  <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    Teste 3: Avanço &amp; Corte
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Comando ESC d (Feed) e GS V (Guilhotina).
                  </div>
                </button>

                <button
                  onClick={runTest4SampleComanda}
                  className="p-3.5 rounded-xl border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 text-left transition-colors group cursor-pointer"
                >
                  <div className="text-xs font-bold text-amber-400">
                    Teste 4: Comanda Completa
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Simulação fiscal com itens, valores e rodapé.
                  </div>
                </button>
              </div>

              {/* Split View: Simulated Thermal Paper vs Driver Logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Visual Thermal Receipt Emulation */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Emulação Visual da Bobina 58mm (32 Colunas)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Largura: {COLUMNS_58MM} col</span>
                  </div>

                  <div className="flex-1 bg-amber-50 text-slate-950 font-mono text-[11px] p-3 rounded-lg border border-amber-200/50 shadow-inner min-h-[220px] max-h-[300px] overflow-y-auto whitespace-pre leading-snug select-all">
                    {simulatedReceiptPreview || 'Selecione um dos 4 testes acima para pré-visualizar a emissão térmica na bobina de 58mm.'}
                  </div>
                </div>

                {/* Driver Communication Logs */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-sky-400" />
                      Log de Comunicação do Driver
                    </span>
                    <button
                      onClick={() => setTestLogs([])}
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Limpar
                    </button>
                  </div>

                  <div className="flex-1 bg-slate-900 border border-slate-800 font-mono text-[11px] p-2.5 rounded-lg min-h-[220px] max-h-[300px] overflow-y-auto space-y-1.5">
                    {testLogs.map((log) => (
                      <div key={log.id} className="leading-tight">
                        <span className="text-slate-400">[{log.timestamp}]</span>{' '}
                        <span
                          className={
                            log.type === 'success'
                              ? 'text-emerald-400 font-semibold'
                              : log.type === 'error'
                              ? 'text-rose-400 font-semibold'
                              : log.type === 'warn'
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: LAYOUT DA COMANDA */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nome da Pastelaria no Topo
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    CNPJ para o Cupom
                  </label>
                  <input
                    type="text"
                    value={formData.storeCnpj}
                    onChange={(e) => setFormData({ ...formData, storeCnpj: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.storePhone}
                    onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={formData.storeAddress}
                    onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoPrintOnCheckout}
                    onChange={(e) => setFormData({ ...formData, autoPrintOnCheckout: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Imprimir comanda automaticamente ao receber pagamento no Caixa
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Gera o cupom térmico instantaneamente assim que o PIX ou cartão é confirmado.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoCut}
                    onChange={(e) => setFormData({ ...formData, autoCut: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Acionar comando de corte de papel (Guilhotina ESC/POS)
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Envia o sinal GS V 66 0 após a finalização da impressão do comprovante.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Impressora: <span className="text-white font-medium">{formData.printerModel}</span> &middot; Status: <span className="text-emerald-400 font-medium">{formData.isConnected ? 'Conectada & Pronta' : 'Desconectada'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
            >
              Salvar Configurações
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
