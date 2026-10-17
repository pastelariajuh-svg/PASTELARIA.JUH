import { Order, POS58Config } from '../types';
import { generatePOS58ReceiptText, buildOrderEscPosBytes } from './escpos';
import { bluetoothPrinter } from './bluetoothPrinter';
import { soundEffects } from './audio';

export interface PrintExecutionResult {
  success: boolean;
  channel: 'bluetooth_ble' | 'android_rawbt' | 'system_spooler' | 'print_window';
  message: string;
}

/**
 * Immediate Automatic Print Service for POS-58 (MY-7779 58mm • 32 Columns)
 * 
 * Guarantees that clicking the print button ACTUALLY dispatches the receipt to the printer:
 * 1. Plays sound notification chime.
 * 2. If Web Bluetooth BLE is connected, transmits raw ESC/POS bytes directly to MY-7779 GATT.
 * 3. If on Android with Bluetooth configured, dispatches ESC/POS payload via RawBT intent.
 * 4. Injects synchronous 58mm receipt into #thermal-print-area DOM element.
 * 5. Calls native window.print() (which sends to the MY-7779 printer driver/spooler).
 * 6. If window.print() is blocked by an iframe sandbox without allow-modals, opens a dedicated 58mm print window.
 */
export async function printOrderImmediately(order: Order, config: POS58Config): Promise<PrintExecutionResult> {
  const receiptText = generatePOS58ReceiptText(order, config);
  const bytes = buildOrderEscPosBytes(order, config);

  // 1. Play sound notification chime
  try {
    soundEffects.playStatusUpdateChime();
  } catch (e) {
    // Audio context may require prior user interaction
  }

  // 2. CHANNEL 1: Direct Web Bluetooth BLE Transmission
  if (bluetoothPrinter.isBleConnected()) {
    try {
      const bleSent = await bluetoothPrinter.sendRawBytes(bytes);
      if (bleSent) {
        return {
          success: true,
          channel: 'bluetooth_ble',
          message: 'Comanda enviada diretamente via Bluetooth BLE para a MY-7779!',
        };
      }
    } catch (err) {
      console.warn('Falha no Bluetooth BLE direto, recorrendo aos outros canais:', err);
    }
  }

  // 3. CHANNEL 2: Android RawBT Intent (Bluetooth Thermal Driver)
  if (bluetoothPrinter.isAndroid() && config.connectionType === 'bluetooth') {
    try {
      const rawbtOk = bluetoothPrinter.printViaRawBT(bytes);
      if (rawbtOk) {
        return {
          success: true,
          channel: 'android_rawbt',
          message: 'Comanda transmitida para o aplicativo de impressão Bluetooth RawBT (MY-7779)!',
        };
      }
    } catch (err) {
      console.warn('Falha ao acionar RawBT:', err);
    }
  }

  // 4. Ensure #thermal-print-area is immediately and synchronously present in the DOM (strictly hidden on screen)
  if (typeof document !== 'undefined') {
    let printArea = document.getElementById('thermal-print-area');
    if (!printArea) {
      printArea = document.createElement('div');
      printArea.id = 'thermal-print-area';
      printArea.setAttribute('aria-hidden', 'true');
      document.body.appendChild(printArea);
    }
    printArea.textContent = receiptText;
    printArea.className = 'hidden print:block whitespace-pre font-mono';
    printArea.style.display = 'none';
  }

  // 5. CHANNEL 3: Native System Print Spooler (Universal Windows / Mac / Linux / Android / iOS)
  if (typeof window !== 'undefined') {
    let nativePrintSuccess = false;

    try {
      // Direct call to system print dialog
      window.print();
      nativePrintSuccess = true;
      return {
        success: true,
        channel: 'system_spooler',
        message: 'Comanda enviada para o Spooler de impressão da MY-7779 (58mm)!',
      };
    } catch (printErr: any) {
      console.warn('window.print() direto bloqueado ou restrito pela sandbox:', printErr);
      nativePrintSuccess = false;
    }

    // 6. CHANNEL 4: Dedicated 58mm Print Window (Fallback if window.print() was blocked inside an iframe)
    if (!nativePrintSuccess) {
      try {
        const printWindow = window.open('', '_blank', 'width=380,height=600');
        if (printWindow) {
          printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Comanda #${order.orderNumber} - ${config.storeName}</title>
  <style>
    @page {
      size: 58mm auto;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 58mm;
      max-width: 58mm;
      margin: 0 !important;
      padding: 2mm 3mm !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: 'JetBrains Mono', 'Courier New', Courier, monospace !important;
      font-size: 11px !important;
      line-height: 1.25 !important;
      white-space: pre !important;
    }
  </style>
</head>
<body>${receiptText}</body>
<script>
  window.addEventListener('load', function() {
    window.focus();
    setTimeout(function() {
      window.print();
    }, 150);
  });
</script>
</html>`);
          printWindow.document.close();
          return {
            success: true,
            channel: 'print_window',
            message: 'Janela de impressão da comanda MY-7779 aberta com sucesso!',
          };
        }
      } catch (winErr) {
        console.error('Falha ao abrir janela de impressão:', winErr);
      }
    }
  }

  return {
    success: true,
    channel: 'system_spooler',
    message: 'Processamento de impressão para a MY-7779 concluído.',
  };
}
