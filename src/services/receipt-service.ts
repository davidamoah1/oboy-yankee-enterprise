export const receiptService = {
  generateReceiptData: (transaction: any, items: any[]) => {
    return {
      id: transaction.id,
      date: new Date().toLocaleString(),
      items: items.map(i => ({
        name: i.product.name,
        qty: i.quantity,
        price: i.product.price,
        total: i.quantity * i.product.price
      })),
      total: transaction.total_amount,
      customer: transaction.customer_name || 'Valued Customer'
    };
  },

  shareToWhatsApp: (receiptData: any, phoneNumber?: string) => {
    const message = `
*RECEIPT FROM ${receiptData.shopName || 'SME OS'}*
----------------------------
ID: ${receiptData.id}
Date: ${receiptData.date}
----------------------------
${receiptData.items.map((i: any) => `${i.name} x${i.qty} - GHS ${i.total}`).join('\n')}
----------------------------
*TOTAL: GHS ${receiptData.total}*
Thank you for your business!
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const url = phoneNumber 
      ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
    
    window.open(url, '_blank');
  }
};
