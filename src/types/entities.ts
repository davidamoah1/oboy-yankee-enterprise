export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product extends BaseEntity {
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  price: number;
  costPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number | null;
  reorderLevel: number | null;
  categoryId: string | null;
  brandId: string | null;
  imageUrl: string | null;
  isActive: boolean;
  taxRate: number;
  unit: string | null;
  companyId: string;
  branchId: string | null;
  category?: { name: string } | string;
  brand?: { name: string } | null;
  [key: string]: any;
}

export interface Sale extends BaseEntity {
  receiptNumber: string;
  customerId: string | null;
  userId: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'momo' | 'card' | 'bank_transfer' | 'credit';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  status: 'completed' | 'voided' | 'refunded';
  notes: string | null;
  companyId: string;
  branchId: string | null;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface Customer extends BaseEntity {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  balance: number;
  creditLimit: number | null;
  loyaltyPoints: number;
  isActive: boolean;
  companyId: string;
}

export interface Supplier extends BaseEntity {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  balance: number;
  isActive: boolean;
  companyId: string;
}

export interface Category extends BaseEntity {
  name: string;
  description: string | null;
  isActive: boolean;
  companyId: string;
}

export interface Brand extends BaseEntity {
  name: string;
  description: string | null;
  isActive: boolean;
  companyId: string;
}

export interface Expense extends BaseEntity {
  category: string;
  categoryId: string | null;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string | null;
  reference: string | null;
  companyId: string;
  branchId: string | null;
  userId: string | null;
}

export interface Purchase extends BaseEntity {
  supplierId: string;
  status: 'pending' | 'received' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  notes: string | null;
  companyId: string;
  branchId: string | null;
  userId: string | null;
}

export interface Employee extends BaseEntity {
  fullName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  salary: number | null;
  hireDate: string;
  status: 'active' | 'on_leave' | 'terminated';
  companyId: string;
  branchId: string | null;
  departmentId: string | null;
}

export interface CashDrawer extends BaseEntity {
  openingAmount: number;
  closingAmount: number | null;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt: string | null;
  notes: string | null;
  companyId: string;
  branchId: string | null;
  userId: string | null;
}
