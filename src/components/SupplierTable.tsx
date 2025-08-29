import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Phone, Mail, MapPin, User, Building } from "lucide-react";
import { Supplier } from "@/types/supplier";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useState } from "react";

interface SupplierTableProps {
  suppliers: Supplier[];
  onUpdate: (suppliers: Supplier[]) => void;
}

export const SupplierTable = ({ suppliers, onUpdate }: SupplierTableProps) => {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/suppliers/${id}`);
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      onUpdate(updatedSuppliers);
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      handleApiError(error, "Failed to delete supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (supplierData: Partial<Supplier>) => {
    try {
      setLoading(true);
      if (editingSupplier) {
        const res = await axios.put(`http://localhost:5000/suppliers/${editingSupplier.id}`, supplierData);
        const updatedSuppliers = suppliers.map(s => 
          s.id === editingSupplier.id ? res.data.data : s
        );
        onUpdate(updatedSuppliers);
        setIsEditDialogOpen(false);
        setEditingSupplier(null);
        toast({
          title: "Success",
          description: "Supplier updated successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
    } catch (error) {
      handleApiError(error, "Failed to update supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/suppliers", supplierData);
      onUpdate([...suppliers, res.data.data]);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Supplier added successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      handleApiError(error, "Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message || defaultMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
  };

  if (loading && suppliers.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <SupplierForm onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-green-100 border border-green-200">
                    <AvatarFallback className="bg-green-100 text-green-800 font-medium">
                      {supplier.company_name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{supplier.company_name || "N/A"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{supplier.contact_person || "N/A"}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  {supplier.region_name || "N/A"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.location || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.sector_name || "N/A"}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-green-600 hover:bg-green-50"
                  onClick={() => handleEdit(supplier)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDelete(supplier.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-green-100 border border-green-200">
                      <AvatarFallback className="bg-green-100 text-green-800 font-medium text-xs">
                        {supplier.company_name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    {supplier.company_name || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{supplier.contact_person || "N/A"}</span>
                    <span className="text-sm text-muted-foreground">{supplier.contact_position || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    {supplier.location || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    {supplier.region_name || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    {supplier.sector_name || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 hover:bg-green-50"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {editingSupplier && (
            <SupplierForm 
              initialData={editingSupplier}
              onSubmit={handleSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (data: any) => void;
}

const SupplierForm = ({ initialData, onSubmit }: SupplierFormProps) => {
  const [formData, setFormData] = useState({
    company_name: initialData?.company_name || "",
    contact_person: initialData?.contact_person || "",
    contact_position: initialData?.contact_position || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "",
    region_code: initialData?.region_code || "",
    sector_code: initialData?.sector_code || "",
    janitors: initialData?.janitors || [{ name: '', phone: '', account: '' }]
  });

  const [newJanitors, setNewJanitors] = useState(formData.janitors);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      janitors: newJanitors.filter(j => j.name || j.phone || j.account)
    });
  };

  const handleAddJanitorField = () => {
    setNewJanitors([...newJanitors, { name: '', phone: '', account: '' }]);
  };

  const handleRemoveJanitorField = (index: number) => {
    const updatedJanitors = [...newJanitors];
    updatedJanitors.splice(index, 1);
    setNewJanitors(updatedJanitors);
  };

  const handleJanitorChange = (index: number, field: string, value: string) => {
    const updatedJanitors = [...newJanitors];
    updatedJanitors[index] = { ...updatedJanitors[index], [field]: value };
    setNewJanitors(updatedJanitors);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person *</Label>
          <Input
            id="contact_person"
            name="contact_person"
            value={formData.contact_person}
            onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_position">Position</Label>
          <Input
            id="contact_position"
            name="contact_position"
            value={formData.contact_position}
            onChange={(e) => setFormData({...formData, contact_position: e.target.value})}
            placeholder="e.g., Manager, Director"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="contact@company.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-sm font-medium flex items-center gap-2 mb-3 text-green-700">
          <User className="h-4 w-4" />
          Janitors
        </h3>
        
        <div className="space-y-3">
          {newJanitors.map((janitor, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <div>
                <Label className="block text-xs font-medium mb-1">Name</Label>
                <Input
                  value={janitor.name}
                  onChange={(e) => handleJanitorChange(index, 'name', e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-xs font-medium mb-1">Phone</Label>
                <Input
                  value={janitor.phone}
                  onChange={(e) => handleJanitorChange(index, 'phone', e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="block text-xs font-medium mb-1">Account</Label>
                  <Input
                    value={janitor.account}
                    onChange={(e) => handleJanitorChange(index, 'account', e.target.value)}
                  />
                </div>
                {newJanitors.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => handleRemoveJanitorField(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAddJanitorField}
          className="text-green-600 border-green-300 hover:bg-green-50 mt-3"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Janitor
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => initialData ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {initialData ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
};