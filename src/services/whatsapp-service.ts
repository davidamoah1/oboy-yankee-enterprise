/**
 * WhatsApp Business Workflow Service
 * Generates WhatsApp click-to-chat links for receipts, reports, and alerts.
 */

export interface ReceiptData {
  orderId: string;
  customerName?: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: string;
  businessName: string;
}

export interface LowStockAlertData {
  productName: string;
  currentStock: number;
  reorderLevel: number;
  businessName: string;
}

export interface PaymentConfirmationData {
  transactionId: string;
  amount: number;
  method: string;
  clientName: string;
  businessName: string;
}

class WhatsAppService {
  /**
   * Helper to format any custom Ghanaian number to uniform international representation (233XXXXXXXXX)
   */
  private formatGhanaPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      return `233${cleanPhone.slice(1)}`;
    }
    if (cleanPhone.startsWith('233')) {
      return cleanPhone;
    }
    return `233${cleanPhone}`;
  }

  /**
   * Generates a seamless WhatsApp click-to-chat WA.ME receipt link
   */
  shareReceipt(phone: string, data: ReceiptData): string {
    const formattedPhone = this.formatGhanaPhone(phone);
    const itemsText = data.items
      .map(item => `• ${item.name} x${item.quantity} - ₵${(item.quantity * Number(item.price)).toFixed(2)}`)
      .join('\n');

    const message = `*${data.businessName} - Official Receipt*\n` +
      `--------------------------------\n` +
      `*Order:* #${data.orderId}\n` +
      `*Customer:* ${data.customerName || 'Valued Customer'}\n` +
      `*Total:* GH₵ ${Number(data.total).toFixed(2)}\n` +
      `*Payment:* ${data.paymentMethod.toUpperCase()}\n` +
      `--------------------------------\n` +
      `*Items:*\n${itemsText}\n\n` +
      `Thank you for your business! 🇬🇭\n` +
      `_Powered by OBOY YANKEE ENTERPRISE_`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Generates a click-to-chat link for daily summary metrics
   */
  shareDailySummary(phone: string, stats: { totalSales: number; count: number; date: string; businessName: string }): string {
    const formattedPhone = this.formatGhanaPhone(phone);
    const message = `*Daily Business Insight*\n` +
      `*Business:* ${stats.businessName}\n` +
      `*Date:* ${stats.date}\n` +
      `--------------------------------\n` +
      `*Total Sales:* GH₵ ${stats.totalSales.toFixed(2)}\n` +
      `*Transaction Count:* ${stats.count}\n` +
      `--------------------------------\n` +
      `Check your dashboard to perform visual analytics.\n` +
      `_OBOY YANKEE ENTERPRISE Business Intelligence_`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Generates a low stock warning WhatsApp link
   */
  shareLowStockAlert(phone: string, data: LowStockAlertData): string {
    const formattedPhone = this.formatGhanaPhone(phone);
    const message = `⚠️ *LOW STOCK WARNING - ${data.businessName}* ⚠️\n` +
      `--------------------------------\n` +
      `*Product:* ${data.productName}\n` +
      `*Current Stock:* ${data.currentStock} units remaining\n` +
      `*Reorder Level:* threshold is ${data.reorderLevel} units\n` +
      `--------------------------------\n` +
      `Please contact your Ghanaian supplier soonest to prevent stockouts.\n` +
      `_Automated Inventory Daemon_`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Generates a payment confirmation WhatsApp link
   */
  sharePaymentConfirmation(phone: string, data: PaymentConfirmationData): string {
    const formattedPhone = this.formatGhanaPhone(phone);
    const message = `✅ *Payment Received - ${data.businessName}* ✅\n` +
      `--------------------------------\n` +
      `*Amount:* GH₵ ${Number(data.amount).toFixed(2)}\n` +
      `*Channel:* ${data.method.toUpperCase()}\n` +
      `*Status:* Reconciled & Audited\n` +
      `*Audited Transaction ID:* ${data.transactionId}\n` +
      `--------------------------------\n` +
      `Thank you for your business ${data.clientName}.\n` +
      `_SME Business Operating System_`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }
}

export const whatsapp = new WhatsAppService();
export default whatsapp;
