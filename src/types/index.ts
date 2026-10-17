export type ProductCategory =
  | 'pasteis-salgados-doces'
  | 'sanduiches'
  | 'salgados'
  | 'bebidas-sucos-refrigerantes'
  | 'doces'
  | 'combos';

export interface CategoryMeta {
  id: ProductCategory;
  label: string;
  description: string;
  iconName: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number; // e.g. 120 (grams) or 1 (unit)
  unit: 'g' | 'ml' | 'un' | 'kg' | 'l';
  costPerUnit: number; // cost in BRL for the unit used
}

export interface TechnicalSheet {
  prepTimeMinutes: number;
  yieldPortions: number;
  ingredients: RecipeIngredient[];
  prepInstructions: string;
  totalCostBrl: number;
  allergens?: string[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  stockQuantity: number;
  minStockWarning: number;
  technicalSheet: TechnicalSheet;
  badge?: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

export type OrderItemStatus = 'recebido' | 'preparando' | 'pronto' | 'entregue';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  category: ProductCategory;
  addedAt: string;
  status: OrderItemStatus;
}

export type OrderStatus =
  | 'aberta'
  | 'cozinha_recebido'
  | 'em_preparo'
  | 'pronto'
  | 'finalizada_paga'
  | 'cancelada';

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerCpf?: string;
  customerPhone?: string;
  tableOrType: string; // "Mesa 01", "Mesa 04", "Balcão", "Viagem"
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod?: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
  changeFor?: number;
  notes?: string;
  isReopened?: boolean;
}

export interface StockItem {
  id: string;
  name: string;
  currentQuantity: number;
  minQuantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'un';
  costPerUnit: number;
  category: string;
  lastUpdated: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  password?: string;
  provider?: 'local' | 'google' | 'facebook';
}

export type PrinterModel =
  | 'MY-7779'
  | 'POS-58'
  | 'POS-5802'
  | 'MPT-II'
  | 'PT-210'
  | 'GOOJPRT'
  | 'PeriPage'
  | 'Generica-58mm';

export interface POS58Config {
  connectionType: 'bluetooth' | 'system';
  bluetoothDeviceName?: string;
  isConnected: boolean;
  paperWidthMm: number; // 58
  columnsCount: number; // 32
  printerModel: PrinterModel;
  storeName: string;
  storeCnpj: string;
  storePhone: string;
  storeAddress: string;
  autoPrintOnCheckout: boolean;
  autoCut: boolean;
  feedLines: number;
}

export interface InAppNotification {
  id: string;
  orderId: string;
  orderNumber: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  status: OrderStatus;
}
