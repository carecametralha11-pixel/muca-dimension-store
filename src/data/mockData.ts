import { Card, Category, User } from '@/types';

export const categories: Category[] = [
  { 
    id: '1', 
    name: 'INFO', 
    icon: '📋',
    description: 'Cards informativos com dados e detalhes importantes'
  },
];

export const mockCards: Card[] = [];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@muca.com',
    name: 'Admin MUCA',
    role: 'admin',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'user@email.com',
    name: 'Rick Fan',
    role: 'user',
    createdAt: new Date(),
  },
];
