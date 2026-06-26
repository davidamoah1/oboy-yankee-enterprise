import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export const paystack = {
  // Frontend verification (pop-up)
  initTransaction: (config: any) => {
    // This is for the frontend SDK
    // Typically you'd use a script loader for https://js.paystack.co/v1/inline.js
    const handler = (window as any).PaystackPop?.setup({
      ...config,
      callback: (response: any) => config.onSuccess(response),
      onClose: () => config.onClose(),
    });
    handler?.openIframe();
  },

  // Backend verification (proxy through Supabase Edge Function or similar if needed)
  verifyTransaction: async (reference: string) => {
    // In production, NEVER do this from frontend. Proxy it through your backend.
    // For now, this is a placeholder for the logic.
    return { status: 'success', reference };
  }
};
