import { Order, POS58Config } from '../types';

export const COLUMNS_58MM = 32;

/**
 * Format string to exactly N columns, padding or truncating as needed
 */
export function padCenter(text: string, width: number = COLUMNS_58MM): string {
  if (text.length >= width) return text.substring(0, width);
  const left = Math.floor((width - text.length) / 2);
  const right = width - text.length - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

export function padLeftRight(leftText: string, rightText: string, width: number = COLUMNS_58MM): string {
  const available = width - rightText.length;
  if (available <= 0) {
    return (leftText + ' ' + rightText).substring(0, width);
  }
  let truncatedLeft = leftText;
  if (truncatedLeft.length > available - 1) {
    truncatedLeft = truncatedLeft.substring(0, available - 1);
  }
  const spaceCount = Math.max(1, width - truncatedLeft.length - rightText.length);
  return truncatedLeft + ' '.repeat(spaceCount) + rightText;
}

export function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
}

export function formatCurrencyBrl(val: number): string {
  return `R$ ${val.toFixed(2).replace('.', ',')}`;
}

/**
 * Generates plain text receipt strictly formatted to 32 columns for POS-58
 */
export function generatePOS58ReceiptText(order: Order, config: POS58Config): string {
  const line = '-'.repeat(COLUMNS_58MM);
  const doubleLine = '='.repeat(COLUMNS_58MM);
  const lines: string[] = [];

  // Header
  lines.push(doubleLine);
  lines.push(padCenter(config.storeName.toUpperCase()));
  if (config.storeCnpj) lines.push(padCenter(`CNPJ: ${config.storeCnpj}`));
  if (config.storeAddress) lines.push(padCenter(config.storeAddress));
  if (config.storePhone) lines.push(padCenter(`TEL: ${config.storePhone}`));
  lines.push(doubleLine);

  // Order Info
  lines.push(padCenter(`*** COMANDA #${order.orderNumber} ***`));
  lines.push(padLeftRight(`LOCAL: ${order.tableOrType.toUpperCase()}`, new Date(order.createdAt).toLocaleDateString('pt-BR')));
  lines.push(padLeftRight(`CLIENTE: ${order.customerName.toUpperCase()}`, new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })));
  if (order.customerCpf) {
    lines.push(padLeftRight('CPF:', order.customerCpf));
  }
  lines.push(line);

  // Column Headers
  lines.push(padLeftRight('QTD DESCRICAO', 'VALOR'));
  lines.push(line);

  // Items
  order.items.forEach((item) => {
    const itemTotal = formatCurrencyBrl(item.price * item.quantity);
    const itemTitle = `${item.quantity}x ${item.name}`;
    lines.push(padLeftRight(itemTitle, itemTotal));
    if (item.notes) {
      lines.push(`  * ${item.notes.substring(0, COLUMNS_58MM - 4)}`);
    }
  });

  lines.push(line);

  // Totals
  lines.push(padLeftRight('SUBTOTAL:', formatCurrencyBrl(order.totalAmount)));
  if (order.discount > 0) {
    lines.push(padLeftRight('DESCONTO:', `- ${formatCurrencyBrl(order.discount)}`));
  }
  lines.push(padLeftRight('TOTAL A PAGAR:', formatCurrencyBrl(order.finalAmount)));

  // Payment
  lines.push(line);
  const methodMap: Record<string, string> = {
    pix: 'PIX INSTANTANEO',
    cartao_credito: 'CARTAO CREDITO',
    cartao_debito: 'CARTAO DEBITO',
    dinheiro: 'DINHEIRO',
  };
  const payLabel = order.paymentMethod ? (methodMap[order.paymentMethod] || order.paymentMethod.toUpperCase()) : 'ABERTA (PENDENTE)';
  lines.push(padLeftRight('FORMA PAGTO:', payLabel));
  if (order.changeFor && order.changeFor > order.finalAmount) {
    lines.push(padLeftRight('RECEBIDO:', formatCurrencyBrl(order.changeFor)));
    lines.push(padLeftRight('TROCO:', formatCurrencyBrl(order.changeFor - order.finalAmount)));
  }

  lines.push(doubleLine);
  lines.push(padCenter('OBRIGADO PELA PREFERENCIA!'));
  lines.push(padCenter('VOLTE SEMPRE A JUH'));
  lines.push(doubleLine);

  return lines.join('\n');
}

/**
 * ESC/POS binary command encoder for thermal printers
 */
export class EscPosEncoder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init(): this {
    this.buffer.push(0x1B, 0x40); // ESC @ Initialize
    return this;
  }

  alignCenter(): this {
    this.buffer.push(0x1B, 0x61, 0x01); // ESC a 1
    return this;
  }

  alignLeft(): this {
    this.buffer.push(0x1B, 0x61, 0x00); // ESC a 0
    return this;
  }

  alignRight(): this {
    this.buffer.push(0x1B, 0x61, 0x02); // ESC a 2
    return this;
  }

  bold(enable: boolean = true): this {
    this.buffer.push(0x1B, 0x45, enable ? 0x01 : 0x00); // ESC E
    return this;
  }

  doubleHeight(enable: boolean = true): this {
    this.buffer.push(0x1D, 0x21, enable ? 0x10 : 0x00); // GS !
    return this;
  }

  doubleWidth(enable: boolean = true): this {
    this.buffer.push(0x1D, 0x21, enable ? 0x20 : 0x00);
    return this;
  }

  normal(): this {
    this.buffer.push(0x1D, 0x21, 0x00);
    this.buffer.push(0x1B, 0x45, 0x00);
    return this;
  }

  text(str: string): this {
    const cleanStr = removeAccents(str);
    for (let i = 0; i < cleanStr.length; i++) {
      this.buffer.push(cleanStr.charCodeAt(i));
    }
    return this;
  }

  line(str: string = ''): this {
    if (str) this.text(str);
    this.buffer.push(0x0A); // LF
    return this;
  }

  feed(lines: number = 3): this {
    this.buffer.push(0x1B, 0x64, lines); // ESC d n
    return this;
  }

  cut(): this {
    this.feed(3);
    this.buffer.push(0x1D, 0x56, 0x42, 0x00); // GS V 66 0 (Partial Cut)
    return this;
  }

  getUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Builds binary ESC/POS payload for an Order
 */
export function buildOrderEscPosBytes(order: Order, config: POS58Config): Uint8Array {
  const enc = new EscPosEncoder();
  const divider = '-'.repeat(COLUMNS_58MM);
  const doubleDivider = '='.repeat(COLUMNS_58MM);

  enc.alignCenter().bold(true).doubleHeight(true).line(config.storeName.toUpperCase());
  enc.normal().alignCenter();
  if (config.storeCnpj) enc.line(`CNPJ: ${config.storeCnpj}`);
  if (config.storeAddress) enc.line(config.storeAddress);
  if (config.storePhone) enc.line(`Tel: ${config.storePhone}`);
  enc.line(doubleDivider);

  enc.bold(true).doubleHeight(true).line(`COMANDA #${order.orderNumber}`);
  enc.normal();
  enc.bold(true).line(`LOCAL: ${order.tableOrType.toUpperCase()}`);
  enc.normal().alignLeft();
  enc.line(padLeftRight(`CLIENTE: ${order.customerName}`, new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })));
  if (order.customerCpf) {
    enc.line(`CPF: ${order.customerCpf}`);
  }
  enc.line(divider);

  enc.bold(true).line(padLeftRight('QTD DESCRICAO', 'TOTAL'));
  enc.bold(false).line(divider);

  order.items.forEach((item) => {
    const itemTotal = formatCurrencyBrl(item.price * item.quantity);
    enc.line(padLeftRight(`${item.quantity}x ${item.name}`, itemTotal));
    if (item.notes) {
      enc.line(`  * ${item.notes.substring(0, COLUMNS_58MM - 4)}`);
    }
  });

  enc.line(divider);
  enc.line(padLeftRight('SUBTOTAL:', formatCurrencyBrl(order.totalAmount)));
  if (order.discount > 0) {
    enc.line(padLeftRight('DESCONTO:', `- ${formatCurrencyBrl(order.discount)}`));
  }
  enc.bold(true).line(padLeftRight('TOTAL:', formatCurrencyBrl(order.finalAmount)));
  enc.bold(false).line(divider);

  const methodMap: Record<string, string> = {
    pix: 'PIX INSTANTANEO',
    cartao_credito: 'CARTAO CREDITO',
    cartao_debito: 'CARTAO DEBITO',
    dinheiro: 'DINHEIRO',
  };
  const payLabel = order.paymentMethod ? (methodMap[order.paymentMethod] || order.paymentMethod.toUpperCase()) : 'ABERTA';
  enc.line(padLeftRight('PAGAMENTO:', payLabel));

  enc.line(doubleDivider);
  enc.alignCenter().line('OBRIGADO PELA PREFERENCIA!');
  enc.line('PASTELARIA JUH - QUALIDADE & SABOR');

  if (config.autoCut) {
    enc.cut();
  } else {
    enc.feed(config.feedLines || 4);
  }

  return enc.getUint8Array();
}
