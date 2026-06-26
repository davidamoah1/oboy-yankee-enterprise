export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  STORE_KEEPER = 'store_keeper',
  SALES_OFFICER = 'sales_officer',
  ACCOUNTANT = 'accountant',
  HR = 'hr',
  RECEPTIONIST = 'receptionist',
  CUSTOM = 'custom',
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  module: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  role: UserRole;
  customRoleId: string | null;
  status: 'active' | 'suspended' | 'invited';
  companyId: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  permissions: string[];
}

export interface Company {
  id: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  country: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  businessType: string | null;
  settings: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
