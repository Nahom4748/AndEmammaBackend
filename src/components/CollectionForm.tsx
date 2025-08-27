import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InventoryItem, Supplier } from '@/types/inventory';
import { saveCollectionTransaction } from '@/lib/inventoryStorage';
import { toast } from 'sonner';
import { Package2, Camera, Calculator } from 'lucide-react';

interface CollectionFormProps {
  items: InventoryItem[];
  suppliers: Supplier[];
  onSuccess: () => void;
}

export const CollectionForm = ({ items, suppliers, onSuccess }: CollectionFormProps) => {
  const [formData, setFormData] = useState({
    supplierId: '',
    itemId: '',
    quantity: 0,
    unitPrice: 0,
    notes: '',
    image: '',
  });

  const selectedItem = items.find(item => item.id === formData.itemId);
  const selectedSupplier = suppliers.find(supplier => supplier.id === formData.supplierId);
  const totalAmount = formData.quantity * formData.unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId || !formData.itemId || formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const transaction = saveCollectionTransaction({
      supplierId: formData.supplierId,
      supplierName: selectedSupplier?.name || '',
      itemId: formData.itemId,
      itemName: selectedItem?.name || '',
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalAmount,
      notes: formData.notes,
      image: formData.image,
    });

    toast.success(`Collection recorded! Receipt: ${transaction.receiptNumber}`);
    setFormData({
      supplierId: '',
      itemId: '',
      quantity: 0,
      unitPrice: 0,
      notes: '',
      image: '',
    });
    onSuccess();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-primary" />
          Record Collection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={formData.supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.status === 'active').map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="item">Item *</Label>
              <Select value={formData.itemId} onValueChange={(value) => setFormData(prev => ({ ...prev, itemId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {item.category.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={formData.quantity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                placeholder="0"
              />
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

          <div>
            <Label htmlFor="image">Collection Image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
              />
              <Camera className="h-4 w-4 text-muted-foreground" />
            </div>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Collection preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about the collection..."
              rows={3}
            />
          </div>

          {selectedSupplier && selectedItem && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Collection Summary</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Supplier:</span> {selectedSupplier.name}</p>
                <p><span className="font-medium">Item:</span> {selectedItem.name}</p>
                <p><span className="font-medium">Current Stock:</span> {selectedItem.currentStock} qty</p>
                <p><span className="font-medium">New Stock:</span> {selectedItem.currentStock + formData.quantity} qty</p>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!formData.supplierId || !formData.itemId}>
            Record Collection & Generate Receipt
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};