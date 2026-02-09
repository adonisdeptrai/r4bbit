/**
 * Admin Dashboard Types
 */

import { ProductType } from '../../types';

export interface Ticket {
    id: string;
    user: string;
    subject: string;
    status: 'Open' | 'Resolved' | 'Pending';
    date: string;
    priority: 'High' | 'Medium' | 'Low';
}

export interface PendingKeyOrder {
    id: string;
    orderId: string;
    user: string;
    productName: string;
    quantity: number;
    date: string;
    status: 'Paid' | 'Processing' | 'Completed';
    amount: number;
    method: string;
}

// Mock data
export const MOCK_TICKETS: Ticket[] = [
    { id: 'TCK-102', user: 'Alex_T88', subject: 'Key not working for GPM Login', status: 'Open', date: '10 mins ago', priority: 'High' },
    { id: 'TCK-101', user: 'MMO_Hunter', subject: 'How to setup proxy rotation?', status: 'Pending', date: '2 hours ago', priority: 'Medium' },
    { id: 'TCK-099', user: 'Newbie01', subject: 'Refund request for Course', status: 'Resolved', date: '1 day ago', priority: 'Low' },
];

export const INITIAL_PENDING_KEYS: PendingKeyOrder[] = [
    { id: 'KORD-1', orderId: '#ORD-9920', user: 'MMO_Hunter', productName: 'GPM Login License', quantity: 1, date: '10 mins ago', status: 'Paid', amount: 15.00, method: 'Crypto (USDT)' },
    { id: 'KORD-2', orderId: '#ORD-9925', user: 'Sarah_K', productName: 'Multilogin 1 Month', quantity: 2, date: '1 hour ago', status: 'Paid', amount: 30.00, method: 'Bank Transfer' },
    { id: 'KORD-3', orderId: '#ORD-9930', user: 'DevOps_Guy', productName: 'GPM Login License', quantity: 1, date: '3 hours ago', status: 'Processing', amount: 15.00, method: 'Crypto (USDT)' },
];

// Re-export commonly used types
export type { User, Product, ProductType, Order } from '../../types';
