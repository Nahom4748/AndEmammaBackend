import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Receipt } from '@/types/inventory';
import { getCollectionTransactions, getSaleTransactions } from '@/lib/inventoryStorage';
import { Receipt as ReceiptIcon, Download, Eye, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const ModernReceiptViewer = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = () => {
    const collections = getCollectionTransactions();
    const sales = getSaleTransactions();
    
    const allReceipts: Receipt[] = [
      ...collections.map(c => ({
        id: c.id,
        receiptNumber: c.receiptNumber,
        type: 'collection' as const,
        items: [{
          name: c.itemName,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          totalAmount: c.totalAmount,
          vatAmount: c.totalAmount * 0.15
        }],
        subtotal: c.totalAmount / 1.15,
        totalVAT: c.totalAmount * 0.15,
        totalAmount: c.totalAmount,
        date: c.date,
        supplierName: c.supplierName,
        notes: c.notes,
        companyInfo: {
          name: "Mama Products Trading Company",
          address: "Addis Ababa, Ethiopia",
          phone: "+251 911 234 567",
          tinNumber: "TIN-1234567890",
          vatNumber: "VAT-0987654321"
        }
      })),
      ...sales.map(s => ({
        id: s.id,
        receiptNumber: s.receiptNumber,
        type: 'sale' as const,
        items: [{
          name: s.itemName,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          totalAmount: s.totalAmount,
          vatAmount: s.totalAmount * 0.15
        }],
        subtotal: s.totalAmount / 1.15,
        totalVAT: s.totalAmount * 0.15,
        totalAmount: s.totalAmount,
        date: s.date,
        customerName: s.customerName,
        paymentMethod: s.paymentMethod,
        companyInfo: {
          name: "Mama Products Trading Company",
          address: "Addis Ababa, Ethiopia",
          phone: "+251 911 234 567",
          tinNumber: "TIN-1234567890",
          vatNumber: "VAT-0987654321"
        }
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setReceipts(allReceipts);
  };

  const downloadReceipt = (receipt: Receipt) => {
    const receiptHtml = generateReceiptHTML(receipt);
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${receipt.receiptNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded successfully');
  };

  const printReceipt = (receipt: Receipt) => {
    const receiptHtml = generateReceiptHTML(receipt);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateReceiptHTML = (receipt: Receipt) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt ${receipt.receiptNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .company-details { font-size: 12px; line-height: 1.4; }
        .receipt-info { margin: 15px 0; padding: 10px; background: #f5f5f5; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background: #f5f5f5; font-weight: bold; }
        .totals { margin-top: 15px; padding-top: 10px; border-top: 2px solid #000; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .grand-total { font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 5px; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; }
        @media print { body { margin: 0; padding: 10px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${receipt.companyInfo.name}</div>
        <div class="company-details">
            ${receipt.companyInfo.address}<br>
            Phone: ${receipt.companyInfo.phone}<br>
            TIN: ${receipt.companyInfo.tinNumber}<br>
            VAT No: ${receipt.companyInfo.vatNumber}
        </div>
    </div>

    <div class="receipt-info">
        <div><strong>Receipt #:</strong> ${receipt.receiptNumber}</div>
        <div><strong>Type:</strong> ${receipt.type.toUpperCase()}</div>
        <div><strong>Date:</strong> ${new Date(receipt.date).toLocaleString()}</div>
        ${receipt.customerName ? `<div><strong>Customer:</strong> ${receipt.customerName}</div>` : ''}
        ${receipt.supplierName ? `<div><strong>Supplier:</strong> ${receipt.supplierName}</div>` : ''}
        ${receipt.paymentMethod ? `<div><strong>Payment:</strong> ${receipt.paymentMethod.toUpperCase()}</div>` : ''}
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>VAT</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${receipt.items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${item.vatAmount.toFixed(2)}</td>
                    <td>${item.totalAmount.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${receipt.subtotal.toFixed(2)} ETB</span>
        </div>
        <div class="total-row">
            <span>VAT (15%):</span>
            <span>${receipt.totalVAT.toFixed(2)} ETB</span>
        </div>
        <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>${receipt.totalAmount.toFixed(2)} ETB</span>
        </div>
    </div>

    ${receipt.notes ? `<div style="margin-top: 15px;"><strong>Notes:</strong> ${receipt.notes}</div>` : ''}

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>This is a computer-generated receipt.</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Modern Receipt Viewer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {receipts.length === 0 ? (
            <div className="text-center py-8">
              <ReceiptIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No receipts found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {receipts.map(receipt => (
                <Card key={receipt.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={receipt.type === 'sale' ? 'default' : 'secondary'}>
                            {receipt.type.toUpperCase()}
                          </Badge>
                          <span className="font-mono text-sm font-semibold">
                            {receipt.receiptNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(receipt.date).toLocaleString()}
                        </div>
                        <p className="text-sm">
                          {receipt.type === 'sale' 
                            ? (receipt.customerName || 'Walk-in Customer')
                            : receipt.supplierName
                          }
                        </p>
                        <p className="font-semibold text-success">
                          Total: {receipt.totalAmount.toFixed(2)} ETB
                          <span className="text-xs text-muted-foreground ml-2">
                            (VAT: {receipt.totalVAT.toFixed(2)} ETB)
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Receipt Preview - {receipt.receiptNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto">
                              <div dangerouslySetInnerHTML={{ __html: generateReceiptHTML(receipt) }} />
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button onClick={() => printReceipt(receipt)} className="flex-1">
                                Print Receipt
                              </Button>
                              <Button variant="outline" onClick={() => downloadReceipt(receipt)} className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => downloadReceipt(receipt)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};