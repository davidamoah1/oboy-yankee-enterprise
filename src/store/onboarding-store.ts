
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  businessName: string;
  email: string | null;
  tenantId: string | null;
  setBusinessName: (name: string) => void;
  setEmail: (email: string) => void;
  setTenantId: (id: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      businessName: '',
      email: null,
      tenantId: null,
      setBusinessName: (businessName) => set({ businessName }),
      setEmail: (email) => set({ email }),
      setTenantId: (tenantId) => set({ tenantId }),
      reset: () => set({ businessName: '', email: null, tenantId: null }),
    }),
    {
      name: 'sme-onboarding-storage',
    }
  )
);
