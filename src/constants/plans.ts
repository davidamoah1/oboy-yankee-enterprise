import { SubscriptionPlan as PlanType } from "@/types/entities";

export const FALLBACK_PLANS: PlanType[] = [
  {
    id: "7ee6d4be-ea7a-4284-8842-83b3810444fc",
    name: "Starter",
    slug: "starter",
    description: "Perfect for small kiosks, tabletop vendors, and micro-shops.",
    monthly_price: 50.00,
    yearly_price: 500.00,
    currency: "GHS",
    features: ["Up to 100 products", "3 staff accounts", "Basic analytics", "MoMo Payments", "Local backup"],
    limits: { products: 100, staff_accounts: 3, branches: 1 },
    is_active: true,
    is_popular: false,
    trial_days: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "f8b7efc0-032a-4f51-b996-5fc7a6375052",
    name: "Business",
    slug: "business",
    description: "Complete full-scale inventory, advanced sales analytics, and WhatsApp reports for growing shops.",
    monthly_price: 150.00,
    yearly_price: 1500.00,
    currency: "GHS",
    features: ["Unlimited products", "10 staff accounts", "Real-time analytics", "WhatsApp Receipts", "AI Business Assistant", "Low stock predictive alerts"],
    limits: { products: -1, staff_accounts: 10, branches: 3 },
    is_active: true,
    is_popular: true,
    trial_days: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "ce3ce3df-6a97-427a-8fcd-a1ef69c6fc5d",
    name: "Enterprise",
    slug: "enterprise",
    description: "Full-spectrum retail system for multi-branch entities with custom reporting.",
    monthly_price: 450.00,
    yearly_price: 4500.00,
    currency: "GHS",
    features: ["Everything in Business", "Unlimited staff and branches", "Multi-branch warehousing", "Excel/PDF ledger reports", "Priority dedicated systems support"],
    limits: { products: -1, staff_accounts: -1, branches: -1 },
    is_active: true,
    is_popular: false,
    trial_days: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
