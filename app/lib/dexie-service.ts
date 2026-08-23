import { db, DexieCustomer, DexieContract, DexieInstallment, DexieGuarantor } from './dexie-db';

// ==================== CUSTOMER OPERATIONS ====================

export async function addCustomerLocal(
  customer: Omit<DexieCustomer, 'id' | 'createdAt' | 'updatedAt' | 'merchantId'>,
  merchantId: string
) {
  try {
    const id = await db.customers.add({
      ...customer,
      merchantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, localId: id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error adding customer locally:', msg);
    return { error: msg };
  }
}

export async function updateCustomerLocal(id: number, updates: Partial<DexieCustomer>) {
  try {
    await db.customers.update(id, { ...updates, updatedAt: new Date() });
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating customer locally:', msg);
    return { error: msg };
  }
}

export async function deleteCustomerLocal(id: number) {
  try {
    // Cascade: delete customer's contracts, their installments and guarantors
    const contracts = await db.contracts.where('customerId').equals(id).toArray();
    for (const contract of contracts) {
      await deleteContractLocal(contract.id!);
    }
    await db.customers.delete(id);
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting customer locally:', msg);
    return { error: msg };
  }
}

export async function getCustomersLocal(merchantId?: string): Promise<DexieCustomer[]> {
  try {
    if (merchantId) {
      return await db.customers.where('merchantId').equals(merchantId).toArray();
    }
    return await db.customers.toArray();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting customers locally:', msg);
    return [];
  }
}

export async function getCustomerLocal(id: number): Promise<DexieCustomer | undefined> {
  try {
    return await db.customers.get(id);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting customer locally:', msg);
    return undefined;
  }
}

// ==================== CONTRACT OPERATIONS ====================

export async function addContractLocal(
  contract: Omit<DexieContract, 'id' | 'createdAt' | 'updatedAt' | 'merchantId'>,
  merchantId: string
) {
  try {
    const id = await db.contracts.add({
      ...contract,
      merchantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, localId: id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error adding contract locally:', msg);
    return { error: msg };
  }
}

export async function updateContractLocal(id: number, updates: Partial<DexieContract>) {
  try {
    await db.contracts.update(id, { ...updates, updatedAt: new Date() });
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating contract locally:', msg);
    return { error: msg };
  }
}

export async function deleteContractLocal(id: number) {
  try {
    // Cascade: delete installments and guarantors of this contract
    await db.installments.where('contractId').equals(id).delete();
    await db.guarantors.where('contractId').equals(id).delete();
    await db.contracts.delete(id);
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting contract locally:', msg);
    return { error: msg };
  }
}

export async function getContractsLocal(merchantId?: string): Promise<DexieContract[]> {
  try {
    if (merchantId) {
      return await db.contracts.where('merchantId').equals(merchantId).toArray();
    }
    return await db.contracts.toArray();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting contracts locally:', msg);
    return [];
  }
}

export async function getContractLocal(id: number): Promise<DexieContract | undefined> {
  try {
    return await db.contracts.get(id);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting contract locally:', msg);
    return undefined;
  }
}

// ==================== INSTALLMENT OPERATIONS ====================

export async function addInstallmentLocal(installment: Omit<DexieInstallment, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const id = await db.installments.add({
      ...installment,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, localId: id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error adding installment locally:', msg);
    return { error: msg };
  }
}

export async function updateInstallmentLocal(id: number, updates: Partial<DexieInstallment>) {
  try {
    await db.installments.update(id, { ...updates, updatedAt: new Date() });
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating installment locally:', msg);
    return { error: msg };
  }
}

export async function getInstallmentsLocal(contractId?: number): Promise<DexieInstallment[]> {
  try {
    if (contractId) {
      return await db.installments.where('contractId').equals(contractId).toArray();
    }
    return await db.installments.toArray();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting installments locally:', msg);
    return [];
  }
}

/**
 * Generate a full installment schedule for a contract.
 * Equal installments, with the remainder folded into the last one.
 */
export interface InstallmentScheduleInput {
  totalAmount: number;       // after down payment (i.e. remaining amount)
  interestRate?: number;     // percent, e.g. 10 = 10%
  installmentCount: number;
  installmentInterval: number; // days between installments
  contractId?: number;       // stamped by createContractWithSchedule
  contractServerId?: string;
  startDate?: Date;
}

export function buildInstallmentSchedule(input: InstallmentScheduleInput): Omit<DexieInstallment, 'id' | 'createdAt' | 'updatedAt'>[] {
  const {
    totalAmount,
    interestRate = 0,
    installmentCount,
    installmentInterval,
    contractId,
    contractServerId,
    startDate = new Date(),
  } = input;

  if (!installmentCount || installmentCount < 1) return [];

  const withInterest = interestRate > 0 ? totalAmount * (1 + interestRate / 100) : totalAmount;
  const baseInst = Math.floor((withInterest * 100) / installmentCount) / 100;
  const totalInst = baseInst * installmentCount;
  const remCents = Math.round((withInterest - totalInst) * 100) / 100;

  const installments: Omit<DexieInstallment, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  for (let i = 0; i < installmentCount; i++) {
    const amount = i === installmentCount - 1 ? baseInst + remCents : baseInst;
    const dueDate = new Date(startDate.getTime() + (i + 1) * installmentInterval * 24 * 60 * 60 * 1000);
    installments.push({
      amount: Math.round(amount * 100) / 100,
      amountPaid: 0,
      dueDate,
      status: 'UPCOMING',
      contractId,
      contractServerId,
    });
  }

  return installments;
}

export async function createContractWithSchedule(
  contract: Omit<DexieContract, 'id' | 'createdAt' | 'updatedAt' | 'merchantId'>,
  merchantId: string,
  schedule: Omit<DexieInstallment, 'id' | 'createdAt' | 'updatedAt'>[]
) {
  try {
    const contractId = await db.contracts.add({
      ...contract,
      merchantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (schedule.length > 0) {
      await db.installments.bulkAdd(schedule.map((s) => ({
        ...s,
        contractId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })));
    }

    return { success: true, localId: contractId };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating contract with schedule:', msg);
    return { error: msg };
  }
}

// ==================== GUARANTOR OPERATIONS ====================

export async function addGuarantorLocal(guarantor: Omit<DexieGuarantor, 'id' | 'createdAt'>) {
  try {
    const id = await db.guarantors.add({
      ...guarantor,
      createdAt: new Date(),
    });
    return { success: true, localId: id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error adding guarantor locally:', msg);
    return { error: msg };
  }
}

export async function getGuarantorsLocal(contractId: number): Promise<DexieGuarantor[]> {
  try {
    return await db.guarantors.where('contractId').equals(contractId).toArray();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting guarantors locally:', msg);
    return [];
  }
}

// ==================== MERCHANT-SCOPED UTILITIES ====================

/**
 * Delete ALL data belonging to one merchant (used on sign-out so one
 * user's data is never visible to the next user on the same browser).
 */
export async function clearMerchantData(merchantId: string) {
  try {
    const contractIds = (await db.contracts.where('merchantId').equals(merchantId).toArray())
      .map((c) => c.id!);

    await db.customers.where('merchantId').equals(merchantId).delete();

    if (contractIds.length > 0) {
      await db.installments.where('contractId').anyOf(contractIds).delete();
      await db.guarantors.where('contractId').anyOf(contractIds).delete();
    }

    await db.contracts.where('merchantId').equals(merchantId).delete();

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error clearing merchant data:', msg);
    return { error: msg };
  }
}
