import {
  Product,
  Order,
  OrderItem,
  StockItem,
  CustomerUser,
  POS58Config,
  InAppNotification,
  ProductCategory,
} from '../types';
import { soundEffects } from './audio';

const STORAGE_KEYS = {
  PRODUCTS: 'pastelaria_real_products_v3',
  ORDERS: 'pastelaria_real_orders_v3',
  STOCK: 'pastelaria_real_stock_v3',
  CURRENT_USER: 'pastelaria_real_user_v3',
  REGISTERED_USERS: 'pastelaria_real_registered_v3',
  POS_CONFIG: 'pastelaria_real_pos_v3',
  NOTIFICATIONS: 'pastelaria_real_notifs_v3',
};

// Initial Raw Materials for Stock (Realistic inputs for pastel production)
const INITIAL_STOCK: StockItem[] = [
  { id: 'stk_massa_pastel', name: 'Massa de Pastel Artesanal (Discos 20cm)', currentQuantity: 100, minQuantity: 30, unit: 'un', costPerUnit: 0.95, category: 'Massas', lastUpdated: new Date().toISOString() },
  { id: 'stk_carne_moida', name: 'Carne Bovina Moída Temperada', currentQuantity: 10.0, minQuantity: 3.0, unit: 'kg', costPerUnit: 34.0, category: 'Carnes & Recheios', lastUpdated: new Date().toISOString() },
  { id: 'stk_queijo_mussa', name: 'Queijo Mussarela Fatiado/Ralado', currentQuantity: 12.0, minQuantity: 4.0, unit: 'kg', costPerUnit: 38.0, category: 'Frios & Laticínios', lastUpdated: new Date().toISOString() },
  { id: 'stk_catupiry', name: 'Requeijão Cremoso tipo Catupiry', currentQuantity: 8.0, minQuantity: 2.5, unit: 'kg', costPerUnit: 32.0, category: 'Frios & Laticínios', lastUpdated: new Date().toISOString() },
  { id: 'stk_costela', name: 'Costela Bovina Desfiada ao Molho', currentQuantity: 6.0, minQuantity: 2.0, unit: 'kg', costPerUnit: 44.0, category: 'Carnes & Recheios', lastUpdated: new Date().toISOString() },
  { id: 'stk_palmito', name: 'Palmito Picado em Conserva', currentQuantity: 5.0, minQuantity: 2.0, unit: 'kg', costPerUnit: 42.0, category: 'Vegetais & Conservas', lastUpdated: new Date().toISOString() },
  { id: 'stk_nutella', name: 'Creme de Avelã com Cacau', currentQuantity: 4.0, minQuantity: 1.0, unit: 'kg', costPerUnit: 58.0, category: 'Doces & Sobremesas', lastUpdated: new Date().toISOString() },
  { id: 'stk_morango', name: 'Morango Fresco Higienizado', currentQuantity: 3.0, minQuantity: 1.0, unit: 'kg', costPerUnit: 26.0, category: 'Hortifruti', lastUpdated: new Date().toISOString() },
  { id: 'stk_goiabada', name: 'Goiabada Cascão Especial', currentQuantity: 4.0, minQuantity: 1.0, unit: 'kg', costPerUnit: 22.0, category: 'Doces & Sobremesas', lastUpdated: new Date().toISOString() },
  { id: 'stk_oleo_fritura', name: 'Óleo Vegetal Especial para Fritura', currentQuantity: 30.0, minQuantity: 10.0, unit: 'l', costPerUnit: 7.5, category: 'Óleos & Gorduras', lastUpdated: new Date().toISOString() },
  { id: 'stk_cana_acucar', name: 'Cana-de-Açúcar Fresca Selecionada', currentQuantity: 50.0, minQuantity: 15.0, unit: 'kg', costPerUnit: 3.5, category: 'Hortifruti', lastUpdated: new Date().toISOString() },
  { id: 'stk_laranja', name: 'Laranja Pêra para Suco', currentQuantity: 30.0, minQuantity: 10.0, unit: 'kg', costPerUnit: 4.8, category: 'Hortifruti', lastUpdated: new Date().toISOString() },
  { id: 'stk_coca_lata', name: 'Coca-Cola 350ml Lata', currentQuantity: 48, minQuantity: 12, unit: 'un', costPerUnit: 3.2, category: 'Bebidas Industrializadas', lastUpdated: new Date().toISOString() },
  { id: 'stk_guarana_lata', name: 'Guaraná Antarctica 350ml Lata', currentQuantity: 48, minQuantity: 12, unit: 'un', costPerUnit: 2.9, category: 'Bebidas Industrializadas', lastUpdated: new Date().toISOString() },
  { id: 'stk_agua_500', name: 'Água Mineral sem Gás 500ml', currentQuantity: 48, minQuantity: 12, unit: 'un', costPerUnit: 1.4, category: 'Bebidas Industrializadas', lastUpdated: new Date().toISOString() },
  { id: 'stk_recheio_churros', name: 'Doce de Leite Cremoso de Ponto', currentQuantity: 5.0, minQuantity: 1.5, unit: 'kg', costPerUnit: 28.0, category: 'Doces & Sobremesas', lastUpdated: new Date().toISOString() },
];

// Real Products Catalog with Ficha Técnica (NO fake image URLs)
const INITIAL_PRODUCTS: Product[] = [
  // 1. PASTEIS SALGADOS E DOCES
  {
    id: 'prod_pastel_carne_catupiry',
    name: 'Pastel Especial de Carne com Catupiry',
    category: 'pasteis-salgados-doces',
    price: 18.0,
    description: 'Carne moída temperada, requeijão Catupiry e azeitonas picadas em massa crocante e sequinha.',
    isAvailable: true,
    stockQuantity: 100,
    minStockWarning: 15,
    badge: 'Mais Pedido',
    technicalSheet: {
      prepTimeMinutes: 6,
      yieldPortions: 1,
      totalCostBrl: 5.6,
      prepInstructions: 'Massa 20cm, 120g carne moída temperada, 35g Catupiry. Fechar com carretilha dupla e fritar em óleo a 180°C.',
      ingredients: [
        { id: 'stk_massa_pastel', name: 'Massa de Pastel Artesanal', quantity: 1, unit: 'un', costPerUnit: 0.95 },
        { id: 'stk_carne_moida', name: 'Carne Bovina Moída Temperada', quantity: 0.12, unit: 'kg', costPerUnit: 4.08 },
        { id: 'stk_catupiry', name: 'Requeijão Catupiry', quantity: 0.035, unit: 'kg', costPerUnit: 1.12 },
        { id: 'stk_oleo_fritura', name: 'Óleo de Fritura', quantity: 0.04, unit: 'l', costPerUnit: 0.3 },
      ],
      allergens: ['Glúten', 'Derivados de Leite'],
    },
  },
  {
    id: 'prod_pastel_queijo_especial',
    name: 'Pastel de Queijo Especial com Orégano',
    category: 'pasteis-salgados-doces',
    price: 16.0,
    description: 'Dupla camada generosa de mussarela derretida com pitada de orégano aromático.',
    isAvailable: true,
    stockQuantity: 80,
    minStockWarning: 12,
    badge: 'Vegetariano',
    technicalSheet: {
      prepTimeMinutes: 5,
      yieldPortions: 1,
      totalCostBrl: 4.8,
      prepInstructions: 'Massa artesanal 20cm recheada com 110g de mussarela ralada e orégano.',
      ingredients: [
        { id: 'stk_massa_pastel', name: 'Massa de Pastel Artesanal', quantity: 1, unit: 'un', costPerUnit: 0.95 },
        { id: 'stk_queijo_mussa', name: 'Queijo Mussarela', quantity: 0.11, unit: 'kg', costPerUnit: 4.18 },
        { id: 'stk_oleo_fritura', name: 'Óleo de Fritura', quantity: 0.04, unit: 'l', costPerUnit: 0.3 },
      ],
      allergens: ['Glúten', 'Lactose'],
    },
  },
  {
    id: 'prod_pastel_costela_provolone',
    name: 'Pastel de Costela Desfiada c/ Provolone',
    category: 'pasteis-salgados-doces',
    price: 22.0,
    description: 'Costela bovina marinada cozida lentamente com toque defumado de provolone.',
    isAvailable: true,
    stockQuantity: 40,
    minStockWarning: 10,
    badge: 'Especial',
    technicalSheet: {
      prepTimeMinutes: 7,
      yieldPortions: 1,
      totalCostBrl: 7.2,
      prepInstructions: 'Rechear com 130g de costela desfiada temperada e 30g de provolone.',
      ingredients: [
        { id: 'stk_massa_pastel', name: 'Massa de Pastel Artesanal', quantity: 1, unit: 'un', costPerUnit: 0.95 },
        { id: 'stk_costela', name: 'Costela Desfiada', quantity: 0.13, unit: 'kg', costPerUnit: 5.72 },
        { id: 'stk_oleo_fritura', name: 'Óleo de Fritura', quantity: 0.04, unit: 'l', costPerUnit: 0.3 },
      ],
      allergens: ['Glúten', 'Lactose'],
    },
  },
  {
    id: 'prod_pastel_palmito_gourmet',
    name: 'Pastel de Palmito Gourmet Cremoso',
    category: 'pasteis-salgados-doces',
    price: 17.0,
    description: 'Palmito macio selecionado refogado no azeite com cheiro verde e molho leve.',
    isAvailable: true,
    stockQuantity: 35,
    minStockWarning: 8,
    badge: 'Vegetariano',
    technicalSheet: {
      prepTimeMinutes: 5,
      yieldPortions: 1,
      totalCostBrl: 5.2,
      prepInstructions: 'Recheio cremoso 110g bem escorrido para evitar que a massa fure durante a fritura.',
      ingredients: [
        { id: 'stk_massa_pastel', name: 'Massa de Pastel Artesanal', quantity: 1, unit: 'un', costPerUnit: 0.95 },
        { id: 'stk_palmito', name: 'Palmito Picado em Conserva', quantity: 0.1, unit: 'kg', costPerUnit: 4.2 },
      ],
      allergens: ['Glúten'],
    },
  },
  {
    id: 'prod_pastel_nutella_morango',
    name: 'Pastel de Nutella com Morangos Frescos',
    category: 'pasteis-salgados-doces',
    price: 19.0,
    description: 'Creme de avelã com cacau e morangos frescos fatiados, polvilhado com açúcar e canela.',
    isAvailable: true,
    stockQuantity: 50,
    minStockWarning: 10,
    badge: 'Doce',
    technicalSheet: {
      prepTimeMinutes: 5,
      yieldPortions: 1,
      totalCostBrl: 6.4,
      prepInstructions: '60g de creme de avelã e 40g de morangos higienizados secos.',
      ingredients: [
        { id: 'stk_massa_pastel', name: 'Massa de Pastel Artesanal', quantity: 1, unit: 'un', costPerUnit: 0.95 },
        { id: 'stk_nutella', name: 'Creme de Avelã', quantity: 0.06, unit: 'kg', costPerUnit: 3.48 },
        { id: 'stk_morango', name: 'Morango Fresco', quantity: 0.04, unit: 'kg', costPerUnit: 1.04 },
      ],
      allergens: ['Glúten', 'Avelã', 'Leite'],
    },
  },
  {
    id: 'prod_pastel_romeu_julieta',
    name: 'Pastel Romeu & Julieta Supremo',
    category: 'pasteis-salgados-doces',
    price: 16.5,
    description: 'Goiabada cascão cremosa com queijo minas curado derretido.',
    isAvailable: true,
    stockQuantity: 40,
    minStockWarning: 8,
    badge: 'Tradicional',
    technicalSheet: {
      prepTimeMinutes: 5,
      yieldPortions: 1,
      totalCostBrl: 4.5,
      prepInstructions: '70g de goiabada cascão e 60g de queijo.',
      ingredients: [
        { id: 'stk_massa_pastel', name: 'Massa de Pastel Artesanal', quantity: 1, unit: 'un', costPerUnit: 0.95 },
        { id: 'stk_goiabada', name: 'Goiabada Cascão', quantity: 0.07, unit: 'kg', costPerUnit: 1.54 },
        { id: 'stk_queijo_mussa', name: 'Queijo', quantity: 0.06, unit: 'kg', costPerUnit: 2.28 },
      ],
      allergens: ['Glúten', 'Lactose'],
    },
  },

  // 2. SANDUICHES
  {
    id: 'prod_x_pastel_especial',
    name: 'X-Pastel Especial da Casa',
    category: 'sanduiches',
    price: 28.0,
    description: 'Pastel gigante recheado com hambúrguer artesanal, queijo derretido, presunto e salada.',
    isAvailable: true,
    stockQuantity: 25,
    minStockWarning: 5,
    badge: 'Especial da Casa',
    technicalSheet: {
      prepTimeMinutes: 10,
      yieldPortions: 1,
      totalCostBrl: 9.8,
      prepInstructions: 'Massa gigante com recheio completo e fechamento reforçado.',
      ingredients: [
        { id: 'stk_massa_pastel', name: 'Massa Especial', quantity: 1.5, unit: 'un', costPerUnit: 1.4 },
        { id: 'stk_carne_moida', name: 'Carne temperada', quantity: 0.15, unit: 'kg', costPerUnit: 5.1 },
        { id: 'stk_queijo_mussa', name: 'Mussarela', quantity: 0.08, unit: 'kg', costPerUnit: 3.04 },
      ],
      allergens: ['Glúten', 'Ovos', 'Lactose'],
    },
  },
  {
    id: 'prod_bauru_artesanal',
    name: 'Bauru na Chapa no Pão Francês Crocante',
    category: 'sanduiches',
    price: 20.0,
    description: 'Pão francês tostado, carne fatiada temperada, queijo fundido, tomate e orégano.',
    isAvailable: true,
    stockQuantity: 20,
    minStockWarning: 5,
    technicalSheet: {
      prepTimeMinutes: 8,
      yieldPortions: 1,
      totalCostBrl: 6.9,
      prepInstructions: 'Chapa quente, prensar suavemente para derreter o queijo.',
      ingredients: [
        { id: 'stk_queijo_mussa', name: 'Queijo', quantity: 0.09, unit: 'kg', costPerUnit: 3.42 },
        { id: 'stk_carne_moida', name: 'Carne temperada', quantity: 0.1, unit: 'kg', costPerUnit: 3.4 },
      ],
      allergens: ['Glúten', 'Lactose'],
    },
  },

  // 3. SALGADOS
  {
    id: 'prod_coxinha_catupiry',
    name: 'Coxinha Dourada com Catupiry Original',
    category: 'salgados',
    price: 9.5,
    description: 'Massa de caldo caipira, frango desfiado com requeijão Catupiry e casquinha crocante.',
    isAvailable: true,
    stockQuantity: 40,
    minStockWarning: 10,
    badge: 'Frito na Hora',
    technicalSheet: {
      prepTimeMinutes: 6,
      yieldPortions: 1,
      totalCostBrl: 2.8,
      prepInstructions: 'Fritar a 175°C por 4 minutos até adquirir tom dourado.',
      ingredients: [
        { id: 'stk_catupiry', name: 'Catupiry', quantity: 0.025, unit: 'kg', costPerUnit: 0.8 },
        { id: 'stk_oleo_fritura', name: 'Óleo Fritura', quantity: 0.03, unit: 'l', costPerUnit: 0.22 },
      ],
      allergens: ['Glúten', 'Lactose'],
    },
  },
  {
    id: 'prod_kibe_queijo',
    name: 'Kibe Especial com Queijo Derretido',
    category: 'salgados',
    price: 9.5,
    description: 'Trigo para quibe selecionado com carne moída, hortelã fresca e recheio de queijo cremoso.',
    isAvailable: true,
    stockQuantity: 30,
    minStockWarning: 8,
    technicalSheet: {
      prepTimeMinutes: 5,
      yieldPortions: 1,
      totalCostBrl: 3.1,
      prepInstructions: 'Fritura em imersão por 4m30s.',
      ingredients: [
        { id: 'stk_carne_moida', name: 'Carne moída temperada', quantity: 0.07, unit: 'kg', costPerUnit: 2.38 },
        { id: 'stk_queijo_mussa', name: 'Mussarela', quantity: 0.02, unit: 'kg', costPerUnit: 0.76 },
      ],
      allergens: ['Glúten'],
    },
  },
  {
    id: 'prod_empada_palmito',
    name: 'Empada Cremosa de Palmito Artesanal',
    category: 'salgados',
    price: 8.5,
    description: 'Massa podre que derrete na boca com recheio aveludado de palmito refogado.',
    isAvailable: true,
    stockQuantity: 25,
    minStockWarning: 6,
    badge: 'Vegetariano',
    technicalSheet: {
      prepTimeMinutes: 3,
      yieldPortions: 1,
      totalCostBrl: 2.6,
      prepInstructions: 'Aquecer em estufa a 65°C.',
      ingredients: [
        { id: 'stk_palmito', name: 'Palmito', quantity: 0.05, unit: 'kg', costPerUnit: 2.1 },
      ],
      allergens: ['Glúten', 'Ovos'],
    },
  },

  // 4. BEBIDAS SUCOS E REFRIGERANTES
  {
    id: 'prod_caldo_cana_500',
    name: 'Caldo de Cana Gelado 500ml com Limão',
    category: 'bebidas-sucos-refrigerantes',
    price: 10.0,
    description: 'Moído na hora a partir de cana fresca de engenho com gelo e limão taiti.',
    isAvailable: true,
    stockQuantity: 80,
    minStockWarning: 20,
    badge: 'Moído na Hora',
    technicalSheet: {
      prepTimeMinutes: 2,
      yieldPortions: 1,
      totalCostBrl: 2.2,
      prepInstructions: 'Passar cana no engenho, coar em peneira fina, servir em copo 500ml com gelo e limão.',
      ingredients: [
        { id: 'stk_cana_acucar', name: 'Cana fresca', quantity: 0.6, unit: 'kg', costPerUnit: 2.1 },
      ],
      allergens: [],
    },
  },
  {
    id: 'prod_suco_laranja_500',
    name: 'Suco Natural de Laranja 500ml',
    category: 'bebidas-sucos-refrigerantes',
    price: 11.0,
    description: '100% puro suco de laranjas selecionadas espremidas na hora sem água ou conservantes.',
    isAvailable: true,
    stockQuantity: 50,
    minStockWarning: 15,
    technicalSheet: {
      prepTimeMinutes: 2,
      yieldPortions: 1,
      totalCostBrl: 3.2,
      prepInstructions: 'Espremer laranjas frescas na hora do pedido.',
      ingredients: [
        { id: 'stk_laranja', name: 'Laranja Pêra', quantity: 0.7, unit: 'kg', costPerUnit: 3.36 },
      ],
      allergens: [],
    },
  },
  {
    id: 'prod_coca_cola_lata',
    name: 'Coca-Cola 350ml Lata Gelada',
    category: 'bebidas-sucos-refrigerantes',
    price: 6.5,
    description: 'Lata 350ml bem gelada.',
    isAvailable: true,
    stockQuantity: 48,
    minStockWarning: 12,
    technicalSheet: {
      prepTimeMinutes: 1,
      yieldPortions: 1,
      totalCostBrl: 3.2,
      prepInstructions: 'Servir com gelo e limão se desejado.',
      ingredients: [
        { id: 'stk_coca_lata', name: 'Coca-Cola Lata', quantity: 1, unit: 'un', costPerUnit: 3.2 },
      ],
    },
  },
  {
    id: 'prod_guarana_lata',
    name: 'Guaraná Antarctica 350ml Lata',
    category: 'bebidas-sucos-refrigerantes',
    price: 6.5,
    description: 'Lata 350ml bem gelada.',
    isAvailable: true,
    stockQuantity: 48,
    minStockWarning: 12,
    technicalSheet: {
      prepTimeMinutes: 1,
      yieldPortions: 1,
      totalCostBrl: 2.9,
      prepInstructions: 'Servir gelado.',
      ingredients: [
        { id: 'stk_guarana_lata', name: 'Guaraná Antarctica', quantity: 1, unit: 'un', costPerUnit: 2.9 },
      ],
    },
  },
  {
    id: 'prod_agua_mineral',
    name: 'Água Mineral sem Gás 500ml',
    category: 'bebidas-sucos-refrigerantes',
    price: 4.5,
    description: 'Garrafa 500ml gelada ou natural.',
    isAvailable: true,
    stockQuantity: 48,
    minStockWarning: 12,
    technicalSheet: {
      prepTimeMinutes: 1,
      yieldPortions: 1,
      totalCostBrl: 1.4,
      prepInstructions: 'Servir gelada.',
      ingredients: [
        { id: 'stk_agua_500', name: 'Água Mineral', quantity: 1, unit: 'un', costPerUnit: 1.4 },
      ],
    },
  },

  // 5. DOCES
  {
    id: 'prod_mini_churros',
    name: 'Mini Churros com Doce de Leite (6 un)',
    category: 'doces',
    price: 15.0,
    description: 'Porção com 6 unidades crocantes passadas no açúcar e canela com doce de leite.',
    isAvailable: true,
    stockQuantity: 30,
    minStockWarning: 8,
    badge: 'Artesanal',
    technicalSheet: {
      prepTimeMinutes: 4,
      yieldPortions: 1,
      totalCostBrl: 4.2,
      prepInstructions: 'Fritar os churros por 3 minutos, passar no açúcar e canela e servir com doce de leite.',
      ingredients: [
        { id: 'stk_recheio_churros', name: 'Doce de Leite', quantity: 0.05, unit: 'kg', costPerUnit: 1.4 },
        { id: 'stk_oleo_fritura', name: 'Óleo Fritura', quantity: 0.03, unit: 'l', costPerUnit: 0.22 },
      ],
      allergens: ['Glúten', 'Lactose'],
    },
  },
  {
    id: 'prod_pudim_leite',
    name: 'Pudim de Leite Condensado Artesanal (Fatia)',
    category: 'doces',
    price: 9.0,
    description: 'Consistência aveludada com calda dourada de caramelo caseiro.',
    isAvailable: true,
    stockQuantity: 18,
    minStockWarning: 4,
    technicalSheet: {
      prepTimeMinutes: 1,
      yieldPortions: 1,
      totalCostBrl: 2.8,
      prepInstructions: 'Fatiar do pudim refrigerado e regar com calda.',
      ingredients: [
        { id: 'stk_recheio_churros', name: 'Calda e Leite Condensado', quantity: 0.08, unit: 'kg', costPerUnit: 2.2 },
      ],
      allergens: ['Lactose', 'Ovos'],
    },
  },

  // 6. COMBOS
  {
    id: 'prod_combo_classico_juh',
    name: 'Combo Clássico Juh: Pastel + Caldo de Cana + 3 Churros',
    category: 'combos',
    price: 32.0,
    description: '1 Pastel Especial de Carne c/ Catupiry + 1 Caldo de Cana 500ml + 3 Mini Churros.',
    isAvailable: true,
    stockQuantity: 25,
    minStockWarning: 5,
    badge: 'Combo Especial',
    technicalSheet: {
      prepTimeMinutes: 7,
      yieldPortions: 1,
      totalCostBrl: 9.8,
      prepInstructions: 'Fritar pastel e churros simultaneamente e extrair caldo de cana gelado.',
      ingredients: [
        { id: 'stk_massa_pastel', name: 'Massa Artesanal', quantity: 1, unit: 'un', costPerUnit: 0.95 },
        { id: 'stk_carne_moida', name: 'Carne Temperada', quantity: 0.12, unit: 'kg', costPerUnit: 4.08 },
        { id: 'stk_cana_acucar', name: 'Cana-de-Açúcar', quantity: 0.6, unit: 'kg', costPerUnit: 2.1 },
      ],
      allergens: ['Glúten', 'Lactose'],
    },
  },
  {
    id: 'prod_combo_dupla_perfeita',
    name: 'Combo Dupla: 2 Pastéis Grandes + 2 Bebidas',
    category: 'combos',
    price: 52.0,
    description: 'Escolha 2 pastéis salgados ou doces + 2 Caldos de Cana 500ml ou Sucos Naturais.',
    isAvailable: true,
    stockQuantity: 20,
    minStockWarning: 5,
    badge: 'Para Compartilhar',
    technicalSheet: {
      prepTimeMinutes: 8,
      yieldPortions: 2,
      totalCostBrl: 15.6,
      prepInstructions: 'Preparar 2 pastéis e duas bebidas frescas para a mesa.',
      ingredients: [
        { id: 'stk_massa_pastel', name: 'Massa Artesanal', quantity: 2, unit: 'un', costPerUnit: 1.9 },
        { id: 'stk_carne_moida', name: 'Recheio', quantity: 0.24, unit: 'kg', costPerUnit: 8.16 },
      ],
    },
  },
];

// ZERO FAKE ORDERS - Started completely clean
const INITIAL_ORDERS: Order[] = [];

const DEFAULT_POS_CONFIG: POS58Config = {
  connectionType: 'bluetooth',
  isConnected: true,
  bluetoothDeviceName: 'MY-7779 (POS 58mm MY-7779)',
  paperWidthMm: 58,
  columnsCount: 32,
  printerModel: 'MY-7779',
  storeName: 'Pastelaria Juh',
  storeCnpj: '48.912.345/0001-89',
  storePhone: '(11) 98765-4321',
  storeAddress: 'Rua das Pastelarias, 120 - Centro',
  autoPrintOnCheckout: true,
  autoCut: true,
  feedLines: 4,
};

class DatabaseService {
  private products: Product[] = [];
  private orders: Order[] = [];
  private stock: StockItem[] = [];
  private posConfig: POS58Config = DEFAULT_POS_CONFIG;
  private currentUser: CustomerUser | null = null;
  private registeredUsers: CustomerUser[] = [];
  private notifications: InAppNotification[] = [];

  private listeners: (() => void)[] = [];
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.cleanLegacyMockData();
    this.loadFromStorage();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('pastelaria_channel_v3');
      this.broadcastChannel.onmessage = (ev) => {
        if (ev.data === 'sync') {
          this.loadFromStorage();
          this.emitChange(false);
        }
      };
    }
  }

  private cleanLegacyMockData() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('pastelaria_products_v1');
      localStorage.removeItem('pastelaria_orders_v1');
      localStorage.removeItem('pastelaria_stock_v1');
      localStorage.removeItem('pastelaria_current_user_v1');
      localStorage.removeItem('pastelaria_registered_users_v1');
      localStorage.removeItem('pastelaria_notifications_v1');
      localStorage.removeItem('pastelaria_products_v2');
      localStorage.removeItem('pastelaria_orders_v2');
    } catch {
      // ignore
    }
  }

  public purgeAllData(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
        localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      } catch {
        // ignore
      }
    }
    this.orders = [];
    this.notifications = [];
    // Strip any fake mock image URLs
    this.products.forEach((p) => {
      if (p.imageUrl && (p.imageUrl.includes('assets') || p.imageUrl.includes('mock') || p.imageUrl.includes('generated'))) {
        p.imageUrl = undefined;
      }
    });
    this.emitChange();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const parsedProds: Product[] = storedProds ? JSON.parse(storedProds) : INITIAL_PRODUCTS;
      // Guarantee zero fake images
      this.products = parsedProds.map((p) => ({
        ...p,
        imageUrl: p.imageUrl && !p.imageUrl.includes('assets') && !p.imageUrl.includes('mock') ? p.imageUrl : undefined,
      }));

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      this.orders = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;

      const storedStock = localStorage.getItem(STORAGE_KEYS.STOCK);
      this.stock = storedStock ? JSON.parse(storedStock) : INITIAL_STOCK;

      const storedConfig = localStorage.getItem(STORAGE_KEYS.POS_CONFIG);
      this.posConfig = storedConfig ? JSON.parse(storedConfig) : DEFAULT_POS_CONFIG;

      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      this.currentUser = storedUser ? JSON.parse(storedUser) : null;

      const storedUsers = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      // Zero fake users
      this.registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : [];
    } catch {
      this.products = INITIAL_PRODUCTS;
      this.orders = INITIAL_ORDERS;
      this.stock = INITIAL_STOCK;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
      localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(this.stock));
      localStorage.setItem(STORAGE_KEYS.POS_CONFIG, JSON.stringify(this.posConfig));
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(this.registeredUsers));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch {
      // storage full or disabled
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emitChange(broadcast: boolean = true) {
    this.saveToStorage();
    this.listeners.forEach((fn) => fn());
    if (broadcast && this.broadcastChannel) {
      this.broadcastChannel.postMessage('sync');
    }
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public toggleProductAvailability(id: string): void {
    const prod = this.products.find((p) => p.id === id);
    if (prod) {
      prod.isAvailable = !prod.isAvailable;
      this.emitChange();
    }
  }

  public updateProduct(updated: Product): void {
    const idx = this.products.findIndex((p) => p.id === updated.id);
    if (idx !== -1) {
      this.products[idx] = updated;
      this.emitChange();
    }
  }

  public addProduct(product: Product): void {
    this.products.unshift(product);
    this.emitChange();
  }

  public deleteProduct(id: string): void {
    this.products = this.products.filter((p) => p.id !== id);
    this.emitChange();
  }

  // --- ORDERS / COMANDAS ---
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOpenOrders(): Order[] {
    return this.orders.filter((o) => o.status !== 'finalizada_paga' && o.status !== 'cancelada');
  }

  public getSalesBook(): Order[] {
    return this.orders.filter((o) => o.status === 'finalizada_paga');
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public clearAllOrders(): void {
    this.orders = [];
    this.notifications = [];
    this.emitChange();
  }

  public findActiveOrderByTableOrCustomer(tableOrType: string, customerName?: string): Order | undefined {
    return this.orders.find((o) => {
      const isOpen = o.status !== 'finalizada_paga' && o.status !== 'cancelada';
      if (!isOpen) return false;
      if (tableOrType !== 'Balcão' && tableOrType !== 'Viagem') {
        return o.tableOrType.toLowerCase() === tableOrType.toLowerCase();
      }
      return customerName && o.customerName.toLowerCase() === customerName.toLowerCase();
    });
  }

  public placeOrder(params: {
    tableOrType: string;
    customerName: string;
    customerCpf?: string;
    customerPhone?: string;
    items: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      notes?: string;
      category: ProductCategory;
    }[];
    notes?: string;
  }): Order {
    const existing = this.findActiveOrderByTableOrCustomer(params.tableOrType, params.customerName);

    if (existing) {
      params.items.forEach((newItem) => {
        existing.items.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId: newItem.productId,
          name: newItem.name,
          price: newItem.price,
          quantity: newItem.quantity,
          notes: newItem.notes,
          category: newItem.category,
          addedAt: new Date().toISOString(),
          status: 'recebido',
        });
      });

      existing.totalAmount = existing.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      existing.finalAmount = Math.max(0, existing.totalAmount - (existing.discount || 0));
      existing.updatedAt = new Date().toISOString();
      if (existing.status === 'pronto') {
        existing.status = 'em_preparo';
      }

      this.addNotification({
        orderId: existing.id,
        orderNumber: existing.orderNumber,
        title: `Novos itens na Comanda #${existing.orderNumber}`,
        message: `${params.items.length} novo(s) item(ns) adicionados e enviados à cozinha!`,
        status: existing.status,
      });

      soundEffects.playKitchenBell();
      this.emitChange();
      return existing;
    }

    const nextNum = (this.orders.length > 0 ? Math.max(...this.orders.map((o) => o.orderNumber)) : 100) + 1;
    const newOrderItems: OrderItem[] = params.items.map((it, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      productId: it.productId,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      notes: it.notes,
      category: it.category,
      addedAt: new Date().toISOString(),
      status: 'recebido',
    }));

    const totalAmount = newOrderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: nextNum,
      customerName: params.customerName || 'Cliente Balcão',
      customerCpf: params.customerCpf,
      customerPhone: params.customerPhone,
      tableOrType: params.tableOrType,
      items: newOrderItems,
      status: 'cozinha_recebido',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalAmount,
      discount: 0,
      finalAmount: totalAmount,
      notes: params.notes,
    };

    this.orders.unshift(newOrder);

    this.addNotification({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      title: `Nova Comanda Aberta #${newOrder.orderNumber}`,
      message: `Enviada para a cozinha com ${newOrder.items.length} item(ns).`,
      status: 'cozinha_recebido',
    });

    soundEffects.playKitchenBell();
    this.emitChange();
    return newOrder;
  }

  public addItemToComanda(orderId: string, item: { productId: string; name: string; price: number; quantity: number; notes?: string; category: ProductCategory }): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || order.status === 'finalizada_paga') return;

    order.items.push({
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
      category: item.category,
      addedAt: new Date().toISOString(),
      status: 'recebido',
    });

    order.totalAmount = order.items.reduce((s, it) => s + it.price * it.quantity, 0);
    order.finalAmount = Math.max(0, order.totalAmount - (order.discount || 0));
    order.updatedAt = new Date().toISOString();

    soundEffects.playKitchenBell();
    this.emitChange();
  }

  public removeItemFromComanda(orderId: string, itemId: string): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || order.status === 'finalizada_paga') return;

    order.items = order.items.filter((it) => it.id !== itemId);
    order.totalAmount = order.items.reduce((s, it) => s + it.price * it.quantity, 0);
    order.finalAmount = Math.max(0, order.totalAmount - (order.discount || 0));
    order.updatedAt = new Date().toISOString();

    if (order.items.length === 0) {
      order.status = 'cancelada';
    }

    this.emitChange();
  }

  public updateOrderItemStatus(orderId: string, itemId: string, status: OrderItem['status']): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    const item = order.items.find((i) => i.id === itemId);
    if (item) {
      item.status = status;
    }

    const allPronto = order.items.every((i) => i.status === 'pronto' || i.status === 'entregue');
    const anyPreparing = order.items.some((i) => i.status === 'preparando');

    if (allPronto) {
      order.status = 'pronto';
      this.addNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        title: `Pedido Pronto! #${order.orderNumber}`,
        message: `Todos os itens da sua comanda estão prontos para servir!`,
        status: 'pronto',
      });
      soundEffects.playStatusUpdateChime();
    } else if (anyPreparing && order.status === 'cozinha_recebido') {
      order.status = 'em_preparo';
      this.addNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        title: `Em Fritura / Preparo #${order.orderNumber}`,
        message: `Seus pasteis acabaram de entrar na frigideira!`,
        status: 'em_preparo',
      });
      soundEffects.playStatusUpdateChime();
    }

    order.updatedAt = new Date().toISOString();
    this.emitChange();
  }

  public updateOrderStatus(orderId: string, status: Order['status']): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (status === 'em_preparo') {
      order.items.forEach((it) => {
        if (it.status === 'recebido') it.status = 'preparando';
      });
      this.addNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        title: `Em Preparo #${order.orderNumber}`,
        message: `A cozinha começou o preparo da sua comanda.`,
        status: 'em_preparo',
      });
      soundEffects.playStatusUpdateChime();
    } else if (status === 'pronto') {
      order.items.forEach((it) => {
        it.status = 'pronto';
      });
      this.addNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        title: `Pedido Pronto! #${order.orderNumber}`,
        message: `Comanda pronta para retirada no balcão ou entrega na mesa!`,
        status: 'pronto',
      });
      soundEffects.playStatusUpdateChime();
    }

    this.emitChange();
  }

  public closeOrderAtCashier(params: {
    orderId: string;
    discount?: number;
    paymentMethod: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
    changeFor?: number;
  }): Order | null {
    const order = this.orders.find((o) => o.id === params.orderId);
    if (!order) return null;

    order.discount = params.discount || 0;
    order.finalAmount = Math.max(0, order.totalAmount - order.discount);
    order.paymentMethod = params.paymentMethod;
    order.changeFor = params.changeFor;
    order.status = 'finalizada_paga';
    order.closedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    order.items.forEach((it) => {
      it.status = 'entregue';
    });

    this.deductStockForOrder(order);

    soundEffects.playCashRegisterSound();

    this.addNotification({
      orderId: order.id,
      orderNumber: order.orderNumber,
      title: `Comanda #${order.orderNumber} Paga com Sucesso!`,
      message: `Pagamento recebido via ${params.paymentMethod.toUpperCase()}. Estoque atualizado automaticamente.`,
      status: 'finalizada_paga',
    });

    this.emitChange();
    return order;
  }

  public reopenOrder(orderId: string): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    this.restockOrderItems(order);

    order.status = 'aberta';
    order.closedAt = undefined;
    order.isReopened = true;
    order.updatedAt = new Date().toISOString();

    this.emitChange();
  }

  public deleteOrder(orderId: string, restock: boolean = true): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (order && restock && order.status === 'finalizada_paga') {
      this.restockOrderItems(order);
    }
    this.orders = this.orders.filter((o) => o.id !== orderId);
    this.emitChange();
  }

  // --- STOCK DEDUCTION / RESTOCKING ---
  private deductStockForOrder(order: Order) {
    order.items.forEach((item) => {
      const product = this.products.find((p) => p.id === item.productId);
      if (product) {
        product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);

        if (product.technicalSheet && product.technicalSheet.ingredients) {
          product.technicalSheet.ingredients.forEach((ing) => {
            const stockItem = this.stock.find((s) => s.id === ing.id || s.name.toLowerCase() === ing.name.toLowerCase());
            if (stockItem) {
              const totalUsed = ing.quantity * item.quantity;
              stockItem.currentQuantity = Math.max(0, Number((stockItem.currentQuantity - totalUsed).toFixed(3)));
              stockItem.lastUpdated = new Date().toISOString();
            }
          });
        }
      }
    });
  }

  private restockOrderItems(order: Order) {
    order.items.forEach((item) => {
      const product = this.products.find((p) => p.id === item.productId);
      if (product) {
        product.stockQuantity += item.quantity;

        if (product.technicalSheet && product.technicalSheet.ingredients) {
          product.technicalSheet.ingredients.forEach((ing) => {
            const stockItem = this.stock.find((s) => s.id === ing.id || s.name.toLowerCase() === ing.name.toLowerCase());
            if (stockItem) {
              const totalRestock = ing.quantity * item.quantity;
              stockItem.currentQuantity = Number((stockItem.currentQuantity + totalRestock).toFixed(3));
              stockItem.lastUpdated = new Date().toISOString();
            }
          });
        }
      }
    });
  }

  // --- STOCK MANAGEMENT ---
  public getStock(): StockItem[] {
    return [...this.stock];
  }

  public updateStockItem(id: string, quantity: number): void {
    const item = this.stock.find((s) => s.id === id);
    if (item) {
      item.currentQuantity = Math.max(0, quantity);
      item.lastUpdated = new Date().toISOString();
      this.emitChange();
    }
  }

  public addStockMovement(id: string, delta: number): void {
    const item = this.stock.find((s) => s.id === id);
    if (item) {
      item.currentQuantity = Math.max(0, Number((item.currentQuantity + delta).toFixed(3)));
      item.lastUpdated = new Date().toISOString();
      this.emitChange();
    }
  }

  public addStockItem(newItem: StockItem): void {
    this.stock.push(newItem);
    this.emitChange();
  }

  public deleteStockItem(id: string): void {
    this.stock = this.stock.filter((s) => s.id !== id);
    this.emitChange();
  }

  // --- FINANCIAL REPORTS CALCULATIONS ---
  public getFinancialSummary() {
    const closed = this.getSalesBook();
    const totalRevenue = closed.reduce((acc, o) => acc + o.finalAmount, 0);
    const totalDiscounts = closed.reduce((acc, o) => acc + (o.discount || 0), 0);
    const totalOrdersCount = closed.length;
    const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    let totalIngredientCost = 0;
    const categoryRevenue: Record<string, number> = {};
    const paymentMethodsSummary: Record<string, { count: number; total: number }> = {
      pix: { count: 0, total: 0 },
      cartao_credito: { count: 0, total: 0 },
      cartao_debito: { count: 0, total: 0 },
      dinheiro: { count: 0, total: 0 },
    };

    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    closed.forEach((order) => {
      if (order.paymentMethod && paymentMethodsSummary[order.paymentMethod]) {
        paymentMethodsSummary[order.paymentMethod].count += 1;
        paymentMethodsSummary[order.paymentMethod].total += order.finalAmount;
      }

      order.items.forEach((item) => {
        const prod = this.products.find((p) => p.id === item.productId);
        const itemRev = item.price * item.quantity;
        const itemCost = prod?.technicalSheet?.totalCostBrl || (item.price * 0.32);
        totalIngredientCost += itemCost * item.quantity;

        categoryRevenue[item.category] = (categoryRevenue[item.category] || 0) + itemRev;

        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += itemRev;
      });
    });

    const grossProfit = totalRevenue - totalIngredientCost;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalRevenue,
      totalIngredientCost,
      grossProfit,
      grossMarginPercent,
      totalOrdersCount,
      averageTicket,
      totalDiscounts,
      categoryRevenue,
      paymentMethodsSummary,
      topSellingProducts,
    };
  }

  // --- POS-58 PRINTER CONFIG ---
  public getPOSConfig(): POS58Config {
    return { ...this.posConfig };
  }

  public updatePOSConfig(config: Partial<POS58Config>): void {
    this.posConfig = { ...this.posConfig, ...config };
    this.emitChange();
  }

  // --- USER AUTHENTICATION ---
  public getCurrentUser(): CustomerUser | null {
    return this.currentUser;
  }

  public loginWithCpfPassword(cpf: string, password: string): { success: boolean; user?: CustomerUser; error?: string } {
    const cleanCpf = cpf.replace(/\D/g, '');
    const user = this.registeredUsers.find(
      (u) => u.cpf.replace(/\D/g, '') === cleanCpf && u.password === password
    );

    if (user) {
      this.currentUser = user;
      this.emitChange();
      return { success: true, user };
    }
    return { success: false, error: 'CPF ou senha incorretos.' };
  }

  public registerUser(data: { name: string; cpf: string; phone: string; password: string }): { success: boolean; user?: CustomerUser; error?: string } {
    const cleanCpf = data.cpf.replace(/\D/g, '');
    if (this.registeredUsers.some((u) => u.cpf.replace(/\D/g, '') === cleanCpf)) {
      return { success: false, error: 'Este CPF já está cadastrado no sistema.' };
    }

    const newUser: CustomerUser = {
      id: `usr_${Date.now()}`,
      name: data.name,
      cpf: data.cpf,
      phone: data.phone,
      password: data.password,
      provider: 'local',
    };

    this.registeredUsers.push(newUser);
    this.currentUser = newUser;
    this.emitChange();
    return { success: true, user: newUser };
  }

  public loginSocial(provider: 'google' | 'facebook'): CustomerUser {
    const socialUser: CustomerUser = {
      id: `usr_social_${Date.now()}`,
      name: provider === 'google' ? 'Usuário Google' : 'Usuário Facebook',
      cpf: '',
      phone: '',
      provider,
    };
    this.currentUser = socialUser;
    this.emitChange();
    return socialUser;
  }

  public logoutUser(): void {
    this.currentUser = null;
    this.emitChange();
  }

  public recoverPassword(cpfOrPhone: string, newPass: string): { success: boolean; message: string } {
    const clean = cpfOrPhone.replace(/\D/g, '');
    const user = this.registeredUsers.find(
      (u) => u.cpf.replace(/\D/g, '') === clean || u.phone.replace(/\D/g, '') === clean
    );
    if (user) {
      user.password = newPass;
      this.emitChange();
      return { success: true, message: 'Senha redefinida com sucesso!' };
    }
    return { success: false, message: 'Usuário não encontrado para este CPF ou telefone.' };
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): InAppNotification[] {
    return [...this.notifications];
  }

  public addNotification(notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif,
    };
    this.notifications.unshift(newNotif);
    if (this.notifications.length > 20) {
      this.notifications.pop();
    }
    this.emitChange();
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.emitChange();
    }
  }

  public clearNotifications(): void {
    this.notifications = [];
    this.emitChange();
  }
}

export const db = new DatabaseService();
