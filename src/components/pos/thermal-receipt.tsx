import * as React from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ThermalReceiptProps {
  open: boolean;
  onClose: () => void;
  receiptData: {
    receiptNumber: string;
    date: string;
    cashier?: string;
    customer?: string;
    items: { name: string; quantity: number; unitPrice: number; totalPrice: number }[];
    subtotal: number;
    discountAmount?: number;
    nhilAmount?: number;
    getfundAmount?: number;
    vatAmount?: number;
    covidHrlAmount?: number;
    totalAmount: number;
    paymentMethod: string;
    isCredit?: boolean;
    companyName?: string;
    companyPhone?: string;
    companyAddress?: string;
    taxId?: string;
  };
}

export function ThermalReceipt({ open, onClose, receiptData }: ThermalReceiptProps) {
  const fmt = (v: number) => `₵${Number(v || 0).toFixed(2)}`;
  const totalTax = (receiptData.nhilAmount || 0) + (receiptData.getfundAmount || 0) + (receiptData.vatAmount || 0) + (receiptData.covidHrlAmount || 0);

  const handlePrint = () => {
    const printContent = document.getElementById("thermal-receipt-print");
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${receiptData.receiptNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              padding: 4mm;
              font-size: 11px;
              color: #000;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .large { font-size: 14px; }
            .small { font-size: 9px; }
            .divider { border-top: 1px dashed #000; margin: 4px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
            .item-name { flex: 1; }
            .item-qty { width: 25px; text-align: center; }
            .item-price { width: 50px; text-align: right; }
            .total-row { display: flex; justify-content: space-between; margin: 1px 0; }
            .total-final { font-size: 14px; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 4px 0; margin: 4px 0; }
            @media print { body { width: auto; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[400px] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Thermal Receipt</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-sm font-bold">Receipt Preview</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1" onClick={handlePrint}>
              <Printer className="h-3 w-3" /> Print
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div id="thermal-receipt-print" className="p-4 font-mono text-xs text-black bg-white">
          <div className="center">
            <p className="bold large">{receiptData.companyName || "OBOY YANKEE ENTERPRISE"}</p>
            {receiptData.companyAddress && <p className="small">{receiptData.companyAddress}</p>}
            {receiptData.companyPhone && <p className="small">Tel: {receiptData.companyPhone}</p>}
            {receiptData.taxId && <p className="small">TIN: {receiptData.taxId}</p>}
          </div>

          <div className="divider" />

          <div className="center">
            <p className="bold">RECEIPT</p>
            <p className="small">{receiptData.receiptNumber}</p>
            <p className="small">{new Date(receiptData.date).toLocaleString()}</p>
            {receiptData.cashier && <p className="small">Cashier: {receiptData.cashier}</p>}
            {receiptData.customer && <p className="small">Customer: {receiptData.customer}</p>}
          </div>

          <div className="divider" />

          <div className="item-row bold small">
            <span className="item-name">Item</span>
            <span className="item-qty">Qty</span>
            <span className="item-price">U.Cost</span>
            <span className="item-price">Amount</span>
          </div>

          <div className="divider" />

          {receiptData.items.map((item, i) => (
            <div key={i} className="item-row">
              <span className="item-name">{item.name}</span>
              <span className="item-qty">{item.quantity}</span>
              <span className="item-price">{fmt(item.unitPrice)}</span>
              <span className="item-price">{fmt(item.totalPrice)}</span>
            </div>
          ))}

          <div className="divider" />

          <div className="total-row">
            <span>Subtotal</span>
            <span>{fmt(receiptData.subtotal)}</span>
          </div>

          {receiptData.discountAmount && receiptData.discountAmount > 0 && (
            <div className="total-row">
              <span>Discount</span>
              <span>-{fmt(receiptData.discountAmount)}</span>
            </div>
          )}

          {totalTax > 0 && (
            <>
              <div className="divider" />
              <div className="total-row small">
                <span>Tax</span>
                <span>{fmt(totalTax)}</span>
              </div>
            </>
          )}

          <div className="total-final total-row">
            <span>TOTAL</span>
            <span>{fmt(receiptData.totalAmount)}</span>
          </div>

          <div className="center">
            <p className="bold">{receiptData.paymentMethod.toUpperCase()}</p>
            {receiptData.isCredit && <p className="bold small">*** CREDIT SALE ***</p>}
          </div>

          <div className="divider" />

          <div className="center">
            <p className="small">Thank you for shopping with us!</p>
            <p className="small">Goods sold are not returnable after 7 days</p>
            <p className="small">Powered by OBOY YANKEE ENTERPRISE POS</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
