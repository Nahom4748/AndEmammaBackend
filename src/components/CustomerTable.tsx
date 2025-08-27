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
import { Edit, Trash2, Plus, Phone, Mail, MapPin, User, DollarSign } from "lucide-react";
import { Customer } from "@/types/supplier";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

interface CustomerTableProps {
  customers: Customer[];
  onUpdate: (customers: Customer[]) => void;
}

export const CustomerTable = ({ customers, onUpdate }: CustomerTableProps) => {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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
      await axios.delete(`http://localhost:5000/customers/${id}`);
      const updatedCustomers = customers.filter(c => c.id !== id);
      onUpdate(updatedCustomers);
      toast({
        title: "Success",
        description: "Customer deleted successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      handleApiError(error, "Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (customerData: Partial<Customer>) => {
    try {
      setLoading(true);
      if (editingCustomer) {
        const res = await axios.put(`http://localhost:5000/customers/${editingCustomer.id}`, customerData);
        const updatedCustomers = customers.map(c => 
          c.id === editingCustomer.id ? res.data.data : c
        );
        onUpdate(updatedCustomers);
        setIsEditDialogOpen(false);
        setEditingCustomer(null);
        toast({
          title: "Success",
          description: "Customer updated successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
    } catch (error) {
      handleApiError(error, "Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (customerData: Omit<Customer, 'id'>) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/customers", customerData);
      onUpdate([...customers, res.data.data]);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Customer added successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      handleApiError(error, "Failed to add customer");
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

  if (loading && customers.length === 0) {
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
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-green-100 border border-green-200">
                    <AvatarFallback className="bg-green-100 text-green-800 font-medium">
                      {customer.name?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{customer.name || "N/A"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{customer.type || "N/A"}</p>
                  </div>
                </div>
                <Badge variant={getStatusColor(customer.status)}>
                  {customer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.contactPerson.name || "N/A"} - {customer.contactPerson.position || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.contactPerson.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.contactPerson.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.address || "N/A"}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Total Purchases</p>
                  <p className="font-medium">{customer.purchases.total || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {customer.paymentInfo.totalSpent?.toLocaleString() || 0} ETB
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-green-600 hover:bg-green-50"
                  onClick={() => handleEdit(customer)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDelete(customer.id)}
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
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Purchases</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-green-100 border border-green-200">
                      <AvatarFallback className="bg-green-100 text-green-800 font-medium text-xs">
                        {customer.name?.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>
                    {customer.name || "N/A"}
                  </div>
                </TableCell>
                <TableCell>{customer.type || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{customer.contactPerson.name || "N/A"}</span>
                    <span className="text-sm text-muted-foreground">{customer.contactPerson.position || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>{customer.purchases.total || 0}</TableCell>
                <TableCell className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  {customer.paymentInfo.totalSpent?.toLocaleString() || 0} ETB
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 hover:bg-green-50"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(customer.id)}
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
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <CustomerForm 
              initialData={editingCustomer}
              onSubmit={handleSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: any) => void;
}

const CustomerForm = ({ initialData, onSubmit }: CustomerFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "",
    status: initialData?.status || "active",
    contactPerson: {
      name: initialData?.contactPerson.name || "",
      position: initialData?.contactPerson.position || "",
      phone: initialData?.contactPerson.phone || "",
      email: initialData?.contactPerson.email || "",
    },
    address: initialData?.address || "",
    purchases: initialData?.purchases || {
      total: 0,
      thisMonth: 0,
      avgPerMonth: 0,
    },
    paymentInfo: initialData?.paymentInfo || {
      totalSpent: 0,
      outstandingBalance: 0,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({...formData, type: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Packaging">Packaging</SelectItem>
              <SelectItem value="Export">Export</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Contact Person Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Contact Person Name *</Label>
            <Input
              value={formData.contactPerson.name}
              onChange={(e) => setFormData({
                ...formData, 
                contactPerson: {...formData.contactPerson, name: e.target.value}
              })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Position *</Label>
            <Input
              value={formData.contactPerson.position}
              onChange={(e) => setFormData({
                ...formData, 
                contactPerson: {...formData.contactPerson, position: e.target.value}
              })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              value={formData.contactPerson.phone}
              onChange={(e) => setFormData({
                ...formData, 
                contactPerson: {...formData.contactPerson, phone: e.target.value}
              })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.contactPerson.email}
              onChange={(e) => setFormData({
                ...formData, 
                contactPerson: {...formData.contactPerson, email: e.target.value}
              })}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address *</Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />
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
          {initialData ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
};