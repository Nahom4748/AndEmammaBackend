import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Building, MapPin, Phone, Download, Trash2, Loader2, Search, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Customer {
  id: number;
  customerName: string;
  contactPerson: string;
  phone: string;
  sector: string;
  location: string;
  joinDate: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

interface Sector {
  id: number;
  name: string;
  code: string;
}

const API_BASE_URL = "http://localhost:5000";

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSectorsLoading, setIsSectorsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Locations options
  const locations = [
    "Addis Ababa",
    "Dire Dawa",
    "Mekelle",
    "Gondar",
    "Hawassa",
    "Bahir Dar",
    "Jimma",
    "Adama",
    "Arba Minch",
    "Other"
  ];

  // Fetch sectors from backend
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setIsSectorsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/sectors`);
        
        if (response.data.status === "success") {
          setSectors(response.data.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch sectors data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast({
          title: "Error",
          description: "Failed to fetch sectors data",
          variant: "destructive",
        });
      } finally {
        setIsSectorsLoading(false);
      }
    };

    fetchSectors();
  }, [toast]);

  // Fetch customers from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/customers`);
        
        if (response.data.status === "success") {
          setCustomers(response.data.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch customers data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch customers data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [toast]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setFormData({
      status: "active",
      joinDate: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      ...customer,
      joinDate: customer.joinDate.split('T')[0] // Format date for input field
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeletingCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/customers/${deletingCustomer.id}`);
      
      if (response.data.status === "success") {
        setCustomers(prev => prev.filter(customer => customer.id !== deletingCustomer.id));
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingCustomer(null);
    }
  };

  const handleSaveCustomer = async () => {
    if (!formData.customerName || !formData.contactPerson || !formData.phone || !formData.sector || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCustomer) {
        // Update existing customer
        const response = await axios.put(`${API_BASE_URL}/customers/${editingCustomer.id}`, formData);
        
        if (response.data.status === "success") {
          setCustomers(prev => prev.map(customer => 
            customer.id === editingCustomer.id 
              ? response.data.data
              : customer
          ));
          toast({
            title: "Success",
            description: "Customer updated successfully",
          });
        } else {
          throw new Error(response.data.message || "Failed to update customer");
        }
      } else {
        // Create new customer
        const response = await axios.post(`${API_BASE_URL}/customers`, formData);
        
        if (response.data.status === "success") {
          setCustomers(prev => [...prev, response.data.data]);
          toast({
            title: "Success",
            description: "Customer added successfully",
          });
        } else {
          throw new Error(response.data.message || "Failed to add customer");
        }
      }
      
      setIsDialogOpen(false);
      setFormData({});
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingCustomer ? 'update' : 'add'} customer`,
        variant: "destructive",
      });
    }
  };

  const downloadExcel = () => {
    // Create CSV content
    const headers = ["Customer Name", "Contact Person", "Phone", "Sector", "Location", "Join Date", "Status"];
    const csvContent = [
      headers.join(","),
      ...customers.map(customer => [
        `"${customer.customerName}"`,
        `"${customer.contactPerson}"`,
        customer.phone,
        customer.sector,
        customer.location,
        new Date(customer.joinDate).toLocaleDateString(),
        customer.status
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `customers-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "Excel file downloaded successfully",
    });
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCustomers = customers.filter(customer => customer.status === "active").length;
  const inactiveCustomers = customers.filter(customer => customer.status === "inactive").length;

  if (isLoading || isSectorsLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Customers Management</h1>
          <p className="text-green-600 mt-2">Manage your business customers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button 
            onClick={downloadExcel} 
            variant="outline" 
            className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button 
            onClick={handleAddCustomer} 
            className="bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Customers</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{customers.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Customers</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{activeCustomers}</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Inactive Customers</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{inactiveCustomers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="border-green-200">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-green-800">Customers List</CardTitle>
            <CardDescription className="text-green-600">Business customers and their information</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full border-green-300 focus:border-green-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-green-200">
            <Table>
              <TableHeader className="bg-green-50">
                <TableRow>
                  <TableHead className="text-green-800">Customer Name</TableHead>
                  <TableHead className="text-green-800">Contact Person</TableHead>
                  <TableHead className="text-green-800">Phone</TableHead>
                  <TableHead className="text-green-800">Sector</TableHead>
                  <TableHead className="text-green-800">Location</TableHead>
                  <TableHead className="text-green-800">Join Date</TableHead>
                  <TableHead className="text-green-800">Status</TableHead>
                  <TableHead className="text-green-800 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-green-50/50">
                      <TableCell className="font-medium text-green-900">{customer.customerName}</TableCell>
                      <TableCell className="text-green-800">{customer.contactPerson}</TableCell>
                      <TableCell className="text-green-800">{customer.phone}</TableCell>
                      <TableCell className="text-green-800">{customer.sector}</TableCell>
                      <TableCell className="text-green-800">{customer.location}</TableCell>
                      <TableCell className="text-green-800">
                        {new Date(customer.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.status === "active" ? "default" : "secondary"}
                          className={customer.status === "active" 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCustomer(customer)}
                            className="border-green-300 text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer)}
                            className="border-red-300 text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No customers match your search." : "No customers found. Add your first customer to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-green-200">
          <DialogHeader>
            <DialogTitle className="text-green-800">
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription className="text-green-600">
              {editingCustomer ? "Update customer information" : "Add a new business customer"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-green-800">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Company or business name"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-green-800">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Full name of contact person"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-green-800">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+251-911-000-000"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sector" className="text-green-800">Sector *</Label>
                <Select
                  value={formData.sector || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
                >
                  <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map(sector => (
                      <SelectItem key={sector.id} value={sector.name} className="focus:bg-green-50">
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-green-800">Location *</Label>
                <Select
                  value={formData.location || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location} className="focus:bg-green-50">
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="joinDate" className="text-green-800">Join Date</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-green-800">Status</Label>
                <Select
                  value={formData.status || "active"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "active" | "inactive" }))}
                >
                  <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="focus:bg-green-50">Active</SelectItem>
                    <SelectItem value="inactive" className="focus:bg-green-50">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCustomer} 
              className="bg-green-600 hover:bg-green-700"
            >
              {editingCustomer ? "Update" : "Add"} Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md border-green-200">
          <DialogHeader>
            <DialogTitle className="text-green-800">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-green-600">
              Are you sure you want to delete {deletingCustomer?.customerName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteCustomer} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}