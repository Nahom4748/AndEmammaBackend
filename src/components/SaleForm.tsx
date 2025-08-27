import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem } from '@/types/inventory';
import { saveSaleTransaction } from '@/lib/inventoryStorage';
import { toast } from 'sonner';
import { ShoppingCart, Calculator, AlertTriangle } from 'lucide-react';

interface SaleFormProps {
  items: InventoryItem[];
  onSuccess: () => void;
}

export const SaleForm = ({ items, onSuccess }: SaleFormProps) => {
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 0,
    unitPrice: 0,
    customerName: '',
    paymentMethod: 'cash' as 'cash' | 'mobile' | 'bank',
  });

  const selectedItem = items.find(item => item.id === formData.itemId);
  const totalAmount = formData.quantity * formData.unitPrice;
  const isInsufficientStock = selectedItem && formData.quantity > selectedItem.currentStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemId || formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    if (isInsufficientStock) {
      toast.error('Insufficient stock available');
      return;
    }

    const transaction = saveSaleTransaction({
      itemId: formData.itemId,
      itemName: selectedItem?.name || '',
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalAmount,
      customerName: formData.customerName,
      paymentMethod: formData.paymentMethod,
    });

    if (transaction) {
      toast.success(`Sale recorded! Receipt: ${transaction.receiptNumber}`);
      setFormData({
        itemId: '',
        quantity: 0,
        unitPrice: 0,
        customerName: '',
        paymentMethod: 'cash',
      });
      onSuccess();
    } else {
      toast.error('Failed to record sale - insufficient stock');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Record Sale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item">Item *</Label>
            <Select value={formData.itemId} onValueChange={(value) => setFormData(prev => ({ ...prev, itemId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items.filter(item => item.currentStock > 0).map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - Stock: {item.currentStock} qty
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                max={selectedItem?.currentStock || 0}
                value={formData.quantity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                placeholder="0"
                className={isInsufficientStock ? 'border-destructive' : ''}
              />
              {isInsufficientStock && (
                <div className="flex items-center gap-1 text-destructive text-xs mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  Exceeds available stock
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="unitPrice">Unit Price (ETB) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.unitPrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="total">Total Amount (ETB)</Label>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="text-lg font-semibold text-success">
                  {totalAmount.toFixed(2)} ETB
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile">Mobile Payment</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedItem && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Sale Summary</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Item:</span> {selectedItem.name}</p>
                <p><span className="font-medium">Available Stock:</span> {selectedItem.currentStock} qty</p>
                <p><span className="font-medium">After Sale:</span> {selectedItem.currentStock - formData.quantity} qty</p>
                <p><span className="font-medium">Suggested Price:</span> {selectedItem.unitPrice} ETB/qty</p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!formData.itemId || isInsufficientStock}
          >
            Record Sale & Generate Receipt
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};