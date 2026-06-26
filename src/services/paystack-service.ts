import axios from 'axios';

/**
 * SME OS Paystack Integration Service
 * Handles secure payments and subscription flows for Ghana business ecosystem.
 */

interface PaystackTransaction {
  email: string;
  amount: number; // In pesewas
  metadata: {
    tenant_id: string;
    plan: string;
    user_id: string;
  };
}

class PaystackService {
  private publicKey: string;

  constructor() {
    this.publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
  }

  /**
   * Initialize Paystack inline checkout
   */
  async initializeCheckout(data: PaystackTransaction): Promise<any> {
    if (!this.publicKey) {
      throw new Error('Paystack public key is missing');
    }

    // Since we are in a browser environment, we use window.PaystackPop
    // In a production app, the script is usually loaded via CDN or npm
    const handler = (window as any).PaystackPop?.setup({
      key: this.publicKey,
      email: data.email,
      amount: data.amount,
      currency: "GHS",
      metadata: data.metadata,
      callback: (response: any) => {
        console.log('Payment complete! Reference: ' + response.reference);
        return response;
      },
      onClose: () => {
        console.log('Transaction cancelled');
      }
    });

    return handler?.openIframe();
  }

  /**
   * Securely verify transaction via internal backend proxy
   */
  async verifyTransaction(reference: string, tenantId: string, subscriptionId: string) {
    try {
      const response = await axios.post('/api/payments/verify', {
        reference,
        tenant_id: tenantId,
        subscription_id: subscriptionId
      });
      return response.data;
    } catch (error: any) {
      console.error('Payment verification failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Verification failed');
    }
  }
}

export const paystack = new PaystackService();
