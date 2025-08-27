import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Receipt } from '@/types/inventory';
import { toast } from 'sonner';
import { FileText, Search, Download, Calendar, User, Package } from 'lucide-react';
import axios from 'axios';

export const ReceiptViewer = () => {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [allReceipts, setAllReceipts] = useState<Receipt[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const searchReceipt = async () => {
    if (!receiptNumber.trim()) {
      toast.error('Please enter a receipt number');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/sales/receipt/${receiptNumber.trim()}`);
      if (response.data.data) {
        setSelectedReceipt(response.data.data);
        toast.success('Receipt found');
      } else {
        const collectionResponse = await axios.get(`/api/collections/receipt/${receiptNumber.trim()}`);
        if (collectionResponse.data.data) {
          setSelectedReceipt(collectionResponse.data.data);
          toast.success('Receipt found');
        } else {
          toast.error('Receipt not found');
          setSelectedReceipt(null);
        }
      }
    } catch (error) {
      toast.error('Error searching for receipt');
      setSelectedReceipt(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllReceipts = async () => {
    try {
      setIsLoading(true);
      const [salesRes, collectionsRes] = await Promise.all([
        axios.get('/api/sales'),
        axios.get('/api/collections')
      ]);
      
      const allReceipts = [
        ...salesRes.data.data.map((sale: any) => ({ ...sale, type: 'sale' })),
        ...collectionsRes.data.data.map((collection: any) => ({ ...collection, type: 'collection' }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAllReceipts(allReceipts);
      setShowAll(true);
    } catch (error) {
      toast.error('Failed to load receipts');
    } finally {
      setIsLoading(false);
    }
  };

  const printReceipt = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${selectedReceipt?.receiptNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                .row { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #000; padding-top: 10px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getReceiptTypeColor = (type: string) => {
    return type === 'collection' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Receipt Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="receiptNumber">Receipt Number</Label>
              <div className="flex gap-2">
                <Input
                  id="receiptNumber"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Enter receipt number (e.g., COL-123456-ABC)"
                  onKeyPress={(e) => e.key === 'Enter' && searchReceipt()}
                  disabled={isLoading}
                />
                <Button onClick={searchReceipt} disabled={isLoading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={loadAllReceipts}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'View All Receipts'}
              </Button>
            </div>
          </div>

          {selectedReceipt && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div ref={printRef} className="receipt">
                  <div className="header text-center mb-4">
                    <h2 className="text-xl font-bold">RECYCLING CENTER</h2>
                    <p className="text-sm text-muted-foreground">Receipt</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Receipt No:</span>
                      <span className="font-mono">{selectedReceipt.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge className={getReceiptTypeColor(selectedReceipt.type)}>
                        {selectedReceipt.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(selectedReceipt.date).toLocaleString()}</span>
                    </div>
                    {selectedReceipt.supplierName && (
                      <div className="flex justify-between">
                        <span>Supplier:</span>
                        <span>{selectedReceipt.supplierName}</span>
                      </div>
                    )}
                    {selectedReceipt.customerName && (
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>{selectedReceipt.customerName}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-2">Items:</h3>
                    {selectedReceipt.items.map((item, index) => (
                      <div key={index} className="space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{item.quantity} kg × {item.unitPrice} ETB</span>
                          <span>{item.totalAmount.toFixed(2)} ETB</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 total">
                    <div className="flex justify-between">
                      <span>TOTAL AMOUNT:</span>
                      <span>{selectedReceipt.totalAmount.toFixed(2)} ETB</span>
                    </div>
                  </div>

                  {selectedReceipt.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm"><strong>Notes:</strong> {selectedReceipt.notes}</p>
                    </div>
                  )}

                  <div className="text-center mt-6 text-xs text-muted-foreground">
                    <p>Thank you for your business!</p>
                    <p>Keep this receipt for your records</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button onClick={printReceipt} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {showAll && allReceipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Receipts ({allReceipts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedReceipt(receipt)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {receipt.type === 'collection' ? <Package className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      <span className="font-mono text-sm">{receipt.receiptNumber}</span>
                    </div>
                    <Badge className={getReceiptTypeColor(receipt.type)}>
                      {receipt.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(receipt.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {receipt.supplierName || receipt.customerName || 'N/A'}
                    </div>
                    <span className="font-semibold text-success">
                      {receipt.totalAmount.toFixed(2)} ETB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};