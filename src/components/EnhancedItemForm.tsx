import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, Upload, X, Package, DollarSign, FileText, Loader2, Ruler, Box } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import axios from 'axios';

// Set base URL for axios
axios.defaults.baseURL = 'http://localhost:5000';

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  license_number: string;
  address?: string;
  sector: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface EnhancedItemFormProps {
  onItemAdded: () => void;
}

export function EnhancedItemForm({ onItemAdded }: EnhancedItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [collectionDate, setCollectionDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    supplierId: '',
    name: '',
    description: '',
    category: 'mama_products' as const,
    currentStock: 0,
    unitPrice: 0,
    salePrice: 0,
    minStockLevel: 5,
    notes: '',
    size: '',
    dimension: '',
  });

  const categories = [
    { value: 'mama_products', label: 'Mama Products', icon: '🌿' },
    { value: 'bags', label: 'Bags', icon: '👜' },
    { value: 'paper_bags', label: 'Paper Bags', icon: '📦' },
    { value: 'handcrafted', label: 'Handcrafted Items', icon: '✋' },
    { value: 'home_decor', label: 'Home Decor', icon: '🏠' },
    { value: 'accessories', label: 'Accessories', icon: '👒' },
    { value: 'other', label: 'Other', icon: '📦' },
  ];

  const sizeOptions = [
    'Small', 'Medium', 'Large', 'Extra Large', 'Oversized'
  ];

  // Fetch suppliers from backend
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoadingSuppliers(true);
        const response = await axios.get('/item-providers');
        
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          setSuppliers(response.data.data);
        } else {
          throw new Error('Invalid data format from server');
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        toast.error('Failed to load suppliers');
      } finally {
        setIsLoadingSuppliers(false);
      }
    };

    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.supplierId || !formData.name.trim() || !formData.unitPrice || !formData.salePrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedImage) {
      toast.error('Please upload an image of the item');
      return;
    }

    const selectedSupplier = suppliers.find(s => s.id.toString() === formData.supplierId);
    if (!selectedSupplier) {
      toast.error('Please select a valid supplier');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object to send both form data and file
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('currentStock', formData.currentStock.toString());
      formDataToSend.append('unitPrice', formData.unitPrice.toString());
      formDataToSend.append('salePrice', formData.salePrice.toString());
      formDataToSend.append('minStockLevel', formData.minStockLevel.toString());
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('dimension', formData.dimension);
      formDataToSend.append('supplierId', formData.supplierId);
      formDataToSend.append('collectionDate', collectionDate.toISOString());
      
      // Append the image file
      formDataToSend.append('image', selectedImage);

      // Send data to backend with multipart/form-data
      const response = await axios.post('/items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setFormData({
        supplierId: '',
        name: '',
        description: '',
        category: 'mama_products',
        currentStock: 0,
        unitPrice: 0,
        salePrice: 0,
        minStockLevel: 5,
        notes: '',
        size: '',
        dimension: '',
      });
      setSelectedImage(null);
      setCollectionDate(new Date());
      
      setIsOpen(false);
      onItemAdded();
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSupplier = suppliers.find(s => s.id.toString() === formData.supplierId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Inventory Management</h2>
          <p className="text-muted-foreground">Add new items to your inventory</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Add New Inventory Item
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Supplier Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Supplier Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="supplier" className="mb-2 block">Select Supplier *</Label>
                    {isLoadingSuppliers ? (
                      <div className="flex items-center justify-center h-10 border rounded-md bg-muted/20">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading suppliers...
                      </div>
                    ) : (
                      <Select 
                        value={formData.supplierId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Choose a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.filter(s => s.status === 'active').map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{supplier.name}</span>
                                <span className="text-xs text-muted-foreground">{supplier.phone}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {selectedSupplier && (
                      <Card className="mt-2 bg-muted/20 border-primary/20">
                        <CardContent className="p-3">
                          <div className="text-sm space-y-1">
                            <p><strong>Contact:</strong> {selectedSupplier.contact_person}</p>
                            <p><strong>Phone:</strong> {selectedSupplier.phone}</p>
                            <p><strong>Business:</strong> {selectedSupplier.sector}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Item Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Item Details
                  </h3>
                  
                  <div>
                    <Label htmlFor="name" className="mb-2 block">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter item name"
                      className="h-10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="mb-2 block">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="mb-2 block">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the item"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Size & Dimensions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    Size & Dimensions
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="size" className="mb-2 block">Size</Label>
                      <Select 
                        value={formData.size} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dimension" className="mb-2 block">Dimensions</Label>
                      <Input
                        id="dimension"
                        value={formData.dimension}
                        onChange={(e) => setFormData(prev => ({ ...prev, dimension: e.target.value }))}
                        placeholder="e.g., 15x20 cm"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing & Inventory
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="currentStock" className="mb-2 block">Quantity *</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        min="0"
                        value={formData.currentStock}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                        placeholder="0"
                        className="h-10"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="unitPrice" className="mb-2 block">Cost (ETB) *</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                        placeholder="0.00"
                        className="h-10"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="salePrice" className="mb-2 block">Price (ETB) *</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.salePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
                        placeholder="0.00"
                        className="h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minStockLevel" className="mb-2 block">Min Stock Level</Label>
                      <Input
                        id="minStockLevel"
                        type="number"
                        min="0"
                        value={formData.minStockLevel}
                        onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: Number(e.target.value) }))}
                        placeholder="5"
                        className="h-10"
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Collection Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-10 justify-start text-left font-normal",
                              !collectionDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {collectionDate ? format(collectionDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={collectionDate}
                            onSelect={(date) => date && setCollectionDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Item Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    Item Image
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG, WEBP (MAX. 5MB)</p>
                        </div>
                        <input 
                          id="dropzone-file" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                    
                    {selectedImage && (
                      <div className="relative rounded-lg overflow-hidden border">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Preview"
                          className="w-full h-48 object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white text-xs">
                          {selectedImage.name}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Additional Information</h3>
                  
                  <div>
                    <Label htmlFor="notes" className="mb-2 block">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional information about this item"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Item...
                  </>
                ) : (
                  'Add Item to Inventory'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)} 
                className="flex-1 h-11"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}