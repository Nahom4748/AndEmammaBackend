import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt, Download, Printer, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SaleTransaction, Receipt as ReceiptType } from '@/types/inventory';
import jsPDF from 'jspdf';

interface ModernReceiptSystemProps {
  receipts: ReceiptType[];
  onGenerateReceipt: (receipt: any) => ReceiptType;
}

export function ModernReceiptSystem({ receipts, onGenerateReceipt }: ModernReceiptSystemProps) {
    console.log("Receipts data:", receipts); // Debugging line
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);

  const companyInfo = {
    name: "AndE Mamma Manufacturing PLC",
    address: "Addis Ababa, Ethiopia",
    phone: "+251-911-123456",
    tinNumber: "0123456789",
    vatNumber: "ETH-VAT-001234567",
    email: "info@andemamma.com",
    website: "www.andemamma.com",
    logo: "/lovable-uploads/7cde2c34-96e2-4766-b034-2331cc296856.png"
  };

  const generatePDF = (receipt: ReceiptType) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Add logo
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        
        doc.addImage(dataURL, 'PNG', pageWidth - 60, 15, 40, 40);
        generatePDFContent();
      };
      img.src = companyInfo.logo;
    } catch (error) {
      console.log('Logo loading failed, continuing without logo');
      generatePDFContent();
    }

    function generatePDFContent() {
      // Company Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.name, pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(companyInfo.address, pageWidth / 2, 40, { align: 'center' });
      doc.text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email}`, pageWidth / 2, 47, { align: 'center' });
      doc.text(`TIN: ${companyInfo.tinNumber} | VAT: ${companyInfo.vatNumber}`, pageWidth / 2, 54, { align: 'center' });

      // Receipt Info
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SALES RECEIPT', pageWidth / 2, 70, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Receipt #: ${receipt.receiptNumber}`, margin, 85);
      doc.text(`Date: ${new Date(receipt.date).toLocaleString()}`, margin, 92);
      if (receipt.customerName) {
        doc.text(`Customer: ${receipt.customerName}`, margin, 99);
      }
      doc.text(`Payment: ${receipt.paymentMethod?.toUpperCase() || 'CASH'}`, pageWidth - margin - 50, 85);

      // Table Header
      let yPosition = 115;
      doc.setFont('helvetica', 'bold');
      doc.text('Item', margin, yPosition);
      doc.text('Qty', margin + 80, yPosition);
      doc.text('Unit Price', margin + 110, yPosition);
      doc.text('Total', margin + 150, yPosition);

      // Draw line under header
      doc.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3);

      // Items
      yPosition += 12;
      doc.setFont('helvetica', 'normal');
      receipt.items.forEach((item) => {
        doc.text(item.name, margin, yPosition);
        doc.text(item.quantity.toString(), margin + 80, yPosition);
        doc.text(`${item.unitPrice.toFixed(2)} ETB`, margin + 110, yPosition);
        doc.text(`${item.totalAmount.toFixed(2)} ETB`, margin + 150, yPosition);
        yPosition += 8;
      });

      // Totals
      yPosition += 10;
      doc.line(margin + 100, yPosition - 5, pageWidth - margin, yPosition - 5);
      
      doc.text('Subtotal:', margin + 110, yPosition);
      doc.text(`${receipt.subtotal.toFixed(2)} ETB`, margin + 150, yPosition);
      yPosition += 8;
      
      doc.text('VAT (15%):', margin + 110, yPosition);
      doc.text(`${receipt.totalVAT.toFixed(2)} ETB`, margin + 150, yPosition);
      yPosition += 10;
      
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', margin + 110, yPosition);
      doc.text(`${receipt.totalAmount.toFixed(2)} ETB`, margin + 150, yPosition);

      // Footer
      yPosition += 25;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
      doc.text('For any inquiries, please contact us at the above details.', pageWidth / 2, yPosition + 7, { align: 'center' });
    }

    return doc;
  };

  const handleDownloadPDF = (receipt: ReceiptType) => {
    const doc = generatePDF(receipt);
    doc.save(`Receipt-${receipt.receiptNumber}.pdf`);
  };

  const handlePrintPDF = (receipt: ReceiptType) => {
    const doc = generatePDF(receipt);
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Receipt Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {receipts.map(receipt => {
          const itemCount = receipt.items.length;
          const totalQuantity = receipt.items.reduce((sum, item) => sum + item.quantity, 0);
          
          return (
            <Card key={receipt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    {receipt.receiptNumber}
                  </CardTitle>
                  <Badge variant="outline">
                    {receipt.paymentMethod}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p><strong>Items:</strong> {itemCount} (Total: {totalQuantity} qty)</p>
                  <p><strong>Customer:</strong> {receipt.customerName || 'Walk-in'}</p>
                  <p><strong>Date:</strong> {new Date(receipt.date).toLocaleDateString()}</p>
                </div>
                
                <Separator />
                
                <div className="text-right">
                  <p className="text-lg font-bold text-success">
                    {receipt.totalAmount.toFixed(2)} ETB
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (incl. VAT: {receipt.totalVAT.toFixed(2)} ETB)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedReceipt(receipt)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Receipt Preview</DialogTitle>
                      </DialogHeader>
                      {selectedReceipt && (
                        <div className="space-y-4">
                          <ReceiptPreview receipt={selectedReceipt} />
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePrintPDF(receipt)}
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Print
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadPDF(receipt)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ReceiptPreview({ receipt }: { receipt: ReceiptType }) {
  return (
    <div className="bg-white text-black p-6 font-mono text-sm max-w-md mx-auto border rounded-lg">
      {/* Header with Logo */}
      <div className="text-center mb-4 border-b pb-4 relative">
        <img 
          src="/lovable-uploads/7cde2c34-96e2-4766-b034-2331cc296856.png" 
          alt="Company Logo" 
          className="w-12 h-12 mx-auto mb-2 object-contain"
        />
        <h1 className="text-lg font-bold">AndE Mamma Manufacturing PLC</h1>
        <p className="text-xs">Addis Ababa, Ethiopia</p>
        <p className="text-xs">Phone: +251-911-123456</p>
        <p className="text-xs">TIN: 0123456789 | VAT: ETH-VAT-001234567</p>
      </div>

      {/* Receipt Info */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span>{receipt.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date(receipt.date).toLocaleString()}</span>
        </div>
        {receipt.customerName && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{receipt.customerName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Payment:</span>
          <span>{receipt.paymentMethod?.toUpperCase() || 'CASH'}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-t pt-2 mb-4">
        <div className="flex justify-between font-bold mb-2">
          <span>Item</span>
          <span>Total</span>
        </div>
        {receipt.items.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span className="truncate flex-1 mr-2">{item.name}</span>
              <span>{item.totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-600 ml-2">
              {item.quantity} × {item.unitPrice.toFixed(2)} ETB
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{receipt.subtotal.toFixed(2)} ETB</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (15%):</span>
          <span>{receipt.totalVAT.toFixed(2)} ETB</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-1">
          <span>TOTAL:</span>
          <span>{receipt.totalAmount.toFixed(2)} ETB</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-4 pt-4 border-t text-xs">
        <p>Thank you for your business!</p>
        <p>Visit us: www.andemamma.com</p>
      </div>
    </div>
  );
}