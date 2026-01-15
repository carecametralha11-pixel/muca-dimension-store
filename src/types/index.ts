export interface Card {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'INFO' | 'CONSULTÁVEL';
  subcategory?: 'FULLDADOS' | 'AUXILIAR' | null;
  stock: number;
  createdAt: Date;
  // INFO card specific fields
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cpf?: string;
  holderName?: string;
  cardLevel?: string;
  bankName?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Category {
  id: string;
  name: 'INFO' | 'CONSULTÁVEL';
  icon: string;
  description: string;
}

export interface CartItem {
  card: Card;
  quantity: number;
}
