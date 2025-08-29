import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Phone, Mail, MapPin, User, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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

export function SupplierForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    license_number: '',
    sector: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

  const businessSectors = [
    'Manufacturing', 'Agriculture', 'Textiles', 'Handicrafts', 
    'Food Processing', 'Trading', 'Services', 'Other'
  ];

  // Fetch suppliers from backend
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/item-providers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        setSuppliers(data.data);
      } else {
        throw new Error('Invalid data format from server');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.contact_person.trim() || 
        !formData.phone.trim() || !formData.license_number.trim() || 
        !formData.sector.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/item-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save supplier');
      }

      setFormData({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        license_number: '',
        sector: '',
        address: '',
        status: 'active',
      });
      
      setIsOpen(false);
      
      // Refresh the supplier list
      await fetchSuppliers();
      toast.success('Supplier registered successfully');
    } catch (error) {
      console.error('Error registering supplier:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Supplier Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSuppliers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Register New Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Register New Supplier</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="license_number">License Number *</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                        placeholder="Business license number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="sector">Business Sector *</Label>
                    <Select 
                      value={formData.sector} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessSectors.map(sector => (
                          <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_person">Contact Person *</Label>
                      <Input
                        id="contact_person"
                        value={formData.contact_person}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                        placeholder="Primary contact name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+251-xxx-xxx-xxx"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="company@example.com"
                    />
                  </div>
                </div>

                {/* Address & Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Status
                  </h3>
                  
                  <div>
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Complete business address"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register Supplier'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)} 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading suppliers...</span>
        </div>
      )}

      {/* Suppliers Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.length > 0 ? (
            suppliers.map(supplier => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {supplier.name}
                    </CardTitle>
                    <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                      {supplier.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.contact_person}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.phone}</span>
                  </div>
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-xs">{supplier.address}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">
                      Business Sector: <span className="text-primary">{supplier.sector}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      License: {supplier.license_number}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registered: {new Date(supplier.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No suppliers found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by registering your first supplier.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}