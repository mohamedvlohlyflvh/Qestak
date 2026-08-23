import Dexie, { Table } from 'dexie';
import 'dexie-react-hooks';

export interface DexieCustomer {
  id?: number;
  serverId?: string;
  name: string;
  nationalId: string;
  phone: string;
  address: string;
  jobTitle?: string;
  creditScore: number;
  merchantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DexieContract {
  id?: number;
  serverId?: string;
  contractNumber: string;
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  interestRate?: number;
  installmentInterval: number;
  totalPeriodValue?: number;
  totalPeriodUnit?: string;
  description?: string;
  status: string;
  merchantId: string;
  customerId?: number;
  customerServerId?: string;
  customerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DexieInstallment {
  id?: number;
  serverId?: string;
  amount: number;
  amountPaid: number;
  dueDate: Date;
  paidDate?: Date;
  status: string;
  notes?: string;
  contractId?: number;
  contractServerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DexieGuarantor {
  id?: number;
  serverId?: string;
  name: string;
  nationalId: string;
  phone: string;
  address?: string;
  contractId?: number;
  contractServerId?: string;
  createdAt: Date;
}

class QestakDexieDB extends Dexie {
  customers!: Table<DexieCustomer, number>;
  contracts!: Table<DexieContract, number>;
  installments!: Table<DexieInstallment, number>;
  guarantors!: Table<DexieGuarantor, number>;

  constructor() {
    super('QestakDB');
    
    this.version(1).stores({
      customers: '++id, serverId, nationalId, merchantId',
      contracts: '++id, serverId, contractNumber, merchantId, customerId, customerServerId',
      installments: '++id, serverId, contractId, contractServerId, status, dueDate',
      guarantors: '++id, serverId, contractId, contractServerId',
    });
  }
}

export const db = new QestakDexieDB();

export async function initDB() {
  try {
    await db.open();
    console.log('Dexie DB initialized successfully');
  } catch (error) {
    console.error('Failed to open Dexie DB:', error);
  }
}

export async function clearDB() {
  await db.customers.clear();
  await db.contracts.clear();
  await db.installments.clear();
  await db.guarantors.clear();
}
