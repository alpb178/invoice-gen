// src/types/index.ts

export interface Task {
  id?: number;
  number?: number;
  code?: string;
  description: string;
  amount: number;
  hours?: number;
  sortOrder?: number;
}

export interface Section {
  id?: number;
  title: string;
  subtitle?: string;
  sortOrder?: number;
  subtotal?: number;
  tasks: Task[];
}

export interface TeamUser {
  id: number;
  username: string;
  email: string;
}

export interface Team {
  id: number;
  name: string;
  companyName?: string;
  companyCIF?: string;
  companyAddress?: string;
  defaultClientName?: string;
  defaultClientIBAN?: string;
  defaultClientSwift?: string;
  defaultClientBank?: string;
  defaultCurrency?: string;
  defaultNotes?: string;
  owner?: TeamUser;
  members?: TeamUser[];
}

export interface Invitation {
  id: number;
  email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  token?: string;
  acceptUrl?: string;
  expiresAt?: string;
  team?: { id: number; name: string };
  invitedBy?: { username?: string } | null;
}

export interface Invoice {
  id?: number;
  number: string;
  date: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  currency: string;
  companyName: string;
  companyCIF?: string;
  companyAddress?: string;
  clientName: string;
  clientIBAN?: string;
  clientSwift?: string;
  clientBank?: string;
  notes?: string;
  totalAmount?: number;
  exportedAt?: string | null;
  team?: Team | { id: number } | null;
  createdBy?: TeamUser | null;
  sections: Section[];
}
