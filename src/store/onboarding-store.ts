
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SubscriptionPlan } from '@/types/subscription';

interface OnboardingState {
  selectedPlan: string | null; // This will hold the slug
  planId: string | null;      // This will hold the UUID
  billingCycle: 'monthly' | 'yearly';
  businessName: string;
  email: string | null;
  tenantId: string | null;
  setPlan: (slug: string, id: string) => void;
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
  setBusinessName: (name: string) => void;
  setEmail: (email: string) => void;
  setTenantId: (id: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      selectedPlan: null,
      planId: null,
      billingCycle: 'monthly',
      businessName: '',
      email: null,
      tenantId: null,
      setPlan: (selectedPlan, planId) => set({ selectedPlan, planId }),
      setBillingCycle: (billingCycle) => set({ billingCycle }),
      setBusinessName: (businessName) => set({ businessName }),
      setEmail: (email) => set({ email }),
      setTenantId: (tenantId) => set({ tenantId }),
      reset: () => set({ selectedPlan: null, planId: null, billingCycle: 'monthly', businessName: '', email: null, tenantId: null }),
    }),
    {
      name: 'sme-onboarding-storage',
    }
  )
);
