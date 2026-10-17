/**
 * Pix Payload Generator conforming to Brazilian Central Bank EMV BR Code standard
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixCopiaECola(params: {
  key: string;
  name: string;
  city: string;
  amount: number;
  txId?: string;
}): string {
  const cleanKey = params.key;
  const merchantName = params.name.substring(0, 25).toUpperCase();
  const merchantCity = params.city.substring(0, 15).toUpperCase();
  const txid = (params.txId || '***').substring(0, 25);
  const formattedAmount = params.amount.toFixed(2);

  // Merchant Account Info
  const gui = formatField('00', 'br.gov.bcb.pix');
  const key = formatField('01', cleanKey);
  const mai = formatField('26', `${gui}${key}`);

  // Base fields
  let payload = '';
  payload += formatField('00', '01'); // Format indicator
  payload += mai; // Merchant account
  payload += formatField('52', '0000'); // Merchant category code
  payload += formatField('53', '986'); // BRL currency
  payload += formatField('54', formattedAmount); // Transaction Amount
  payload += formatField('58', 'BR'); // Country code
  payload += formatField('59', merchantName); // Merchant Name
  payload += formatField('60', merchantCity); // Merchant City
  payload += formatField('62', formatField('05', txid)); // TxId

  // CRC16 placeholder
  payload += '6304';
  const checksum = crc16(payload);

  return `${payload}${checksum}`;
}
