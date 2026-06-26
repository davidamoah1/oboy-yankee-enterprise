
export enum SubscriptionPlan {
  STARTER = 'starter',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due'
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string | null;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
  paystack_subscription_code: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayment {
  id: string;
  tenant_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  payment_method: string | null;
  paystack_reference: string | null;
  paystack_metadata: Record<string, any>;
  invoice_url: string | null;
  created_at: string;
}

export interface OnboardingProgress {
  id: string;
  tenant_id: string;
  completed_steps: string[];
  current_step: string | null;
  is_completed: boolean;
  metadata: Record<string, any>;
  updated_at: string;
}

export const PLAN_DETAILS = {
  [SubscriptionPlan.STARTER]: {
    name: "Starter",
    price: { monthly: 99, yearly: 990 },
    features: ["Up to 100 products", "1 Branch", "3 Staff accounts", "Basic Analytics", "Offline POS"],
    limits: { products: 100, staff: 3, branches: 1 }
  },
  [SubscriptionPlan.BUSINESS]: {
    name: "Business",
    price: { monthly: 249, yearly: 2490 },
    features: ["Unlimited products", "Up to 3 Branches", "10 Staff accounts", "Advanced Analytics", "Inventory Management", "Momo Integration"],
    limits: { products: 1000000, staff: 10, branches: 3 }
  },
  [SubscriptionPlan.ENTERPRISE]: {
    name: "Enterprise",
    price: { monthly: 599, yearly: 5990 },
    features: ["Unlimited everything", "Multiple Branches", "Custom Roles", "Priority Support", "Dedicated Account Manager", "Custom Reports"],
    limits: { products: 1000000, staff: 1000000, branches: 1000000 }
  }
};
