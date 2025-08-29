import { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
}

interface AddItemDialogProps {
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export const AddItemDialog = ({ onSuccess, trigger }: AddItemDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    supplierId: undefined as number | undefined,
    name: '',
    size: '',
    dimension: '',
    description: '',
    quantity: 0,
    unitPrice: 0,
    salePrice: 0,
    collectionDate: '',
    extraNote: '',
    image: null as File | null,
  });

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/item-providers');
        if (response.data.status === 'success') {
          setSuppliers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        toast.error('Failed to fetch suppliers', {
          style: { background: '#F44336', color: 'white', border: 'none' }
        });
      }
    };

    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.supplierId) {
      newErrors.supplierId = 'Please select a supplier';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }
    
    if (formData.salePrice <= 0) {
      newErrors.salePrice = 'Sale price must be greater than 0';
    }
    
    if (formData.salePrice < formData.unitPrice) {
      newErrors.salePrice = 'Sale price should not be less than unit price';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    
    if (!formData.collectionDate) {
      newErrors.collectionDate = 'Collection date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value) {
          formDataToSend.append(key, value);
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      await axios.post('/api/items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Item added successfully', {
        style: { background: '#4CAF50', color: 'white', border: 'none' }
      });
      setIsOpen(false);
      onSuccess();
      
      // Reset form
      setFormData({
        supplierId: undefined,
        name: '',
        size: '',
        dimension: '',
        description: '',
        quantity: 0,
        unitPrice: 0,
        salePrice: 0,
        collectionDate: '',
        extraNote: '',
        image: null,
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding item:', error);
      let errorMessage = 'Failed to add item';
      
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        style: { background: '#F44336', color: 'white', border: 'none' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-700 text-xl">Add New Item from Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Supplier Selection */}
          <div>
            <Label htmlFor="supplierId" className="text-gray-700 font-medium">Select Supplier *</Label>
            <Select
              value={formData.supplierId ? formData.supplierId.toString() : ''}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                supplierId: value ? parseInt(value) : undefined 
              })}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.supplierId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Choose a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{supplier.name}</span>
                      <span className="text-sm text-gray-500">{supplier.contact_person} • {supplier.phone}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplierId && <p className="text-red-500 text-xs mt-1">{errors.supplierId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-2">Item Details</h3>
              
              <div>
                <Label htmlFor="name" className="text-gray-700">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size" className="text-gray-700">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    disabled={isLoading}
                    placeholder="e.g., Large, 500g"
                  />
                </div>
                <div>
                  <Label htmlFor="dimension" className="text-gray-700">Dimension</Label>
                  <Input
                    id="dimension"
                    value={formData.dimension}
                    onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                    disabled={isLoading}
                    placeholder="e.g., 10x10x5 cm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-2">Pricing & Inventory</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity" className="text-gray-700">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    disabled={isLoading}
                    className={errors.quantity ? 'border-red-500' : ''}
                  />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>
                <div>
                  <Label htmlFor="unitPrice" className="text-gray-700">Unit Cost (ETB) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    disabled={isLoading}
                    className={errors.unitPrice ? 'border-red-500' : ''}
                  />
                  {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="salePrice" className="text-gray-700">Sale Price (ETB) *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                  disabled={isLoading}
                  className={errors.salePrice ? 'border-red-500' : ''}
                />
                {errors.salePrice && <p className="text-red-500 text-xs mt-1">{errors.salePrice}</p>}
              </div>

              <div>
                <Label htmlFor="collectionDate" className="text-gray-700">Collection Date *</Label>
                <Input
                  id="collectionDate"
                  type="date"
                  value={formData.collectionDate}
                  onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                  disabled={isLoading}
                  className={errors.collectionDate ? 'border-red-500' : ''}
                />
                {errors.collectionDate && <p className="text-red-500 text-xs mt-1">{errors.collectionDate}</p>}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 border-b pb-2">Additional Information</h3>
            
            <div>
              <Label htmlFor="extraNote" className="text-gray-700">Extra Notes</Label>
              <Textarea
                id="extraNote"
                value={formData.extraNote}
                onChange={(e) => setFormData({ ...formData, extraNote: e.target.value })}
                disabled={isLoading}
                rows={2}
                placeholder="Any additional information about this item"
              />
            </div>

            <div>
              <Label htmlFor="image" className="text-gray-700">Item Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">Upload an image of the item (optional)</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Adding Item...' : 'Add Item'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)} 
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};