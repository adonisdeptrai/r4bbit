export type ViewState = 'landing' | 'shop' | 'checkout' | 'auth' | 'dashboard' | 'admin' | 'add-product' | 'verify-email' | 'order-success' | 'profile' | 'orders' | 'settings';

export enum ProductType {
  SCRIPT = 'Automation Script',
  TOOL = 'MMO Tool',
  COURSE = 'Course',
  KEY = 'License Key'
}

export interface Product {
  id: string;
  title: string;
  type: ProductType;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  image: string;
  rating: number;
  sales: number;
  // tags: string[]; // Removed in favor of features
  // New fields
  platformId?: string;
  reviewsCount?: number;
  stock?: number;
  unlimitedStock?: boolean;
  platform?: string;
}

export interface Review {
  id: string;
  user: string;
  avatar?: string;
  comment: string;
  rating: number;
  date: string;
  platform: 'Discord' | 'Telegram' | 'Email';
  profit?: string; // Visual proof of earnings e.g. "+$2,400"
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type OrderStatus =
  | 'pending'
  | 'completed'
  | 'processing'
  | 'paid'
  | 'refunded'
  | 'pending_verification'
  | 'failed';

export interface Order {
  id: string;
  orderId?: string; // Human-readable order ID (e.g. #ORD-1234)
  date: string;
  items: string[];
  total: number;
  status: OrderStatus;
  paymentMethod: 'Crypto' | 'Bank Transfer';
  method?: string; // Added for compatibility with backend stats
  invoiceUrl: string;
  amount?: number; // Added for compatibility
  user?: string; // Added for compatibility
  product?: string; // Added for compatibility 
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  balance: number;
  email: string;
  avatar?: string;
}