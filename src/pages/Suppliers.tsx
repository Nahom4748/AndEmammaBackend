import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, Edit, Building, MapPin, Phone, Download, Trash2, Loader2, 
  Search, User, Mail, ChevronDown, ChevronRight, Users, Eye, Filter,
  Calendar, FileText, BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Supplier {
  id: number;
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email?: string;
  phone: string;
  location: string;
  region_name: string;
  region_code: string;
  sector_name: string;
  sector_code: string;
  created_at: string;
  updated_at: string;
  janitors?: Janitor[];
}

interface Region {
  id: number;
  name: string;
  code: string;
}

interface Sector {
  id: number;
  name: string;
  code: string;
}

interface Janitor {
  id?: number;
  name: string;
  phone: string;
  account: string;
}

const API_BASE_URL = "http://localhost:5000";

export default function SuppliersManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegionsLoading, setIsRegionsLoading] = useState(true);
  const [isSectorsLoading, setIsSectorsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    phone: "",
    location: "",
    region_code: "",
    sector_code: "",
    janitors: [{ name: "", phone: "", account: "" }]
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const { toast } = useToast();

  // Fetch regions from backend
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsRegionsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/regions`);
        
        if (response.data.status === "success") {
          setRegions(response.data.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch regions data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch regions data",
          variant: "destructive",
        });
      } finally {
        setIsRegionsLoading(false);
      }
    };

    fetchRegions();
  }, [toast]);

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

  // Fetch suppliers from backend
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/suppliers`);
        
        if (response.data.status === "success") {
          setSuppliers(response.data.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch suppliers data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch suppliers data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, [toast]);

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      company_name: "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      phone: "",
      location: "",
      region_code: "",
      sector_code: "",
      janitors: [{ name: "", phone: "", account: "" }]
    });
    setIsDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      company_name: supplier.company_name,
      contact_person: supplier.contact_person,
      contact_phone: supplier.contact_phone,
      contact_email: supplier.contact_email || "",
      phone: supplier.phone,
      location: supplier.location,
      region_code: supplier.region_code,
      sector_code: supplier.sector_code,
      janitors: supplier.janitors && supplier.janitors.length > 0 
        ? supplier.janitors 
        : [{ name: "", phone: "", account: "" }]
    });
    setIsDialogOpen(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setIsViewDialogOpen(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  };

  const confirmDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/suppliers/${deletingSupplier.id}`);
      
      if (response.data.status === "success") {
        setSuppliers(prev => prev.filter(supplier => supplier.id !== deletingSupplier.id));
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete supplier");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingSupplier(null);
    }
  };

  const handleSaveSupplier = async () => {
    if (!formData.company_name || !formData.contact_person || !formData.contact_phone || 
        !formData.phone || !formData.location || !formData.region_code || !formData.sector_code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const supplierData = {
        company_name: formData.company_name,
        contact_persons: [{ 
          name: formData.contact_person, 
          phone: formData.contact_phone, 
          email: formData.contact_email || "" 
        }],
        phone: formData.phone,
        location: formData.location,
        region_code: formData.region_code,
        sector_code: formData.sector_code,
        janitors: formData.janitors || []
      };

      if (editingSupplier) {
        // Update existing supplier
        const response = await axios.put(`${API_BASE_URL}/suppliers/${editingSupplier.id}`, supplierData);
        
        if (response.data.status === "success") {
          setSuppliers(prev => prev.map(supplier => 
            supplier.id === editingSupplier.id 
              ? response.data.data
              : supplier
          ));
          toast({
            title: "Success",
            description: "Supplier updated successfully",
          });
        } else {
          throw new Error(response.data.message || "Failed to update supplier");
        }
      } else {
        // Create new supplier
        const response = await axios.post(`${API_BASE_URL}/suppliers`, supplierData);
        
        if (response.data.status === "success") {
          setSuppliers(prev => [...prev, response.data.data]);
          toast({
            title: "Success",
            description: "Supplier added successfully",
          });
        } else {
          throw new Error(response.data.message || "Failed to add supplier");
        }
      }
      
      setIsDialogOpen(false);
      setFormData({
        company_name: "",
        contact_person: "",
        contact_phone: "",
        contact_email: "",
        phone: "",
        location: "",
        region_code: "",
        sector_code: "",
        janitors: [{ name: "", phone: "", account: "" }]
      });
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingSupplier ? 'update' : 'add'} supplier`,
        variant: "destructive",
      });
    }
  };

  const addJanitorField = () => {
    setFormData(prev => ({
      ...prev,
      janitors: [...(prev.janitors || []), { name: "", phone: "", account: "" }]
    }));
  };

  const removeJanitorField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      janitors: prev.janitors?.filter((_, i) => i !== index) || []
    }));
  };

  const updateJanitorField = (index: number, field: keyof Janitor, value: string) => {
    setFormData(prev => ({
      ...prev,
      janitors: prev.janitors?.map((janitor, i) => 
        i === index ? { ...janitor, [field]: value } : janitor
      ) || []
    }));
  };

  const downloadExcel = () => {
    // Create CSV content
    const headers = ["Company Name", "Contact Person", "Contact Phone", "Contact Email", "Phone", "Location", "Region", "Sector", "Created At"];
    const csvContent = [
      headers.join(","),
      ...suppliers.map(supplier => [
        `"${supplier.company_name}"`,
        `"${supplier.contact_person}"`,
        supplier.contact_phone,
        supplier.contact_email || "",
        supplier.phone,
        supplier.location,
        supplier.region_name,
        supplier.sector_name,
        new Date(supplier.created_at).toLocaleDateString()
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `suppliers-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "Excel file downloaded successfully",
    });
  };

  // Filter suppliers based on search query and filters
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery) ||
      supplier.contact_phone.includes(searchQuery) ||
      supplier.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = regionFilter === "all" || supplier.region_code === regionFilter;
    const matchesSector = sectorFilter === "all" || supplier.sector_code === sectorFilter;
    
    return matchesSearch && matchesRegion && matchesSector;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading || isRegionsLoading || isSectorsLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
          <p className="text-green-800">Loading suppliers data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-700">Suppliers Management</h1>
          <p className="text-green-600 mt-2">Manage your business suppliers and their janitors</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button 
            onClick={downloadExcel} 
            variant="outline" 
            className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={handleAddSupplier} 
            className="bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Suppliers</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{suppliers.length}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Janitors</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {suppliers.reduce((total, supplier) => total + (supplier.janitors?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Active Regions</CardTitle>
            <MapPin className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {new Set(suppliers.map(s => s.region_code)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-green-800 flex items-center">
                <Search className="h-4 w-4 mr-1" /> Search
              </Label>
              <Input
                id="search"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-green-300 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region" className="text-green-800 flex items-center">
                <MapPin className="h-4 w-4 mr-1" /> Region
              </Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sector" className="text-green-800 flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" /> Sector
              </Label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector.code} value={sector.code}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="border-green-200">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-green-800">Suppliers List</CardTitle>
            <CardDescription className="text-green-600">
              {filteredSuppliers.length} {filteredSuppliers.length === 1 ? 'supplier' : 'suppliers'} found
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-green-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-green-50">
                  <TableRow>
                    <TableHead className="w-8 text-green-800"></TableHead>
                    <TableHead className="text-green-800">Company</TableHead>
                    <TableHead className="text-green-800 hidden md:table-cell">Contact</TableHead>
                    <TableHead className="text-green-800 hidden lg:table-cell">Phone</TableHead>
                    <TableHead className="text-green-800 hidden lg:table-cell">Location</TableHead>
                    <TableHead className="text-green-800">Region</TableHead>
                    <TableHead className="text-green-800 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <>
                        <TableRow key={supplier.id} className="hover:bg-green-50/50">
                          <TableCell className="p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(supplier.id)}
                              className="h-8 w-8 p-0"
                            >
                              {expandedRows.includes(supplier.id) ? (
                                <ChevronDown className="h-4 w-4 text-green-600" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium text-green-900">
                            <div>
                              <div>{supplier.company_name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {supplier.contact_person} • {supplier.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-green-800 hidden md:table-cell">{supplier.contact_person}</TableCell>
                          <TableCell className="text-green-800 hidden lg:table-cell">{supplier.phone}</TableCell>
                          <TableCell className="text-green-800 hidden lg:table-cell">{supplier.location}</TableCell>
                          <TableCell className="text-green-800">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              {supplier.region_name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewSupplier(supplier)}
                                className="border-blue-300 text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSupplier(supplier)}
                                className="border-green-300 text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                                title="Edit supplier"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSupplier(supplier)}
                                className="border-red-300 text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                title="Delete supplier"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRows.includes(supplier.id) && (
                          <TableRow className="bg-green-50/30">
                            <TableCell colSpan={7} className="p-0">
                              <div className="p-4 pl-12 bg-white border-t border-green-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <h4 className="font-medium text-green-800 mb-2 flex items-center">
                                      <User className="h-4 w-4 mr-2" />
                                      Contact Information
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      <div><span className="font-medium">Person:</span> {supplier.contact_person}</div>
                                      <div><span className="font-medium">Phone:</span> {supplier.contact_phone}</div>
                                      {supplier.contact_email && (
                                        <div><span className="font-medium">Email:</span> {supplier.contact_email}</div>
                                      )}
                                      <div><span className="font-medium">Company Phone:</span> {supplier.phone}</div>
                                      <div><span className="font-medium">Location:</span> {supplier.location}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-green-800 mb-2 flex items-center">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      Region & Sector
                                    </h4>
                                    <div className="space-y-2">
                                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                        {supplier.region_name}
                                      </Badge>
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 ml-2">
                                        {supplier.sector_name}
                                      </Badge>
                                    </div>
                                    <div className="mt-3 text-xs text-muted-foreground">
                                      Added on {formatDate(supplier.created_at)}
                                    </div>
                                  </div>
                                </div>
                                
                                {supplier.janitors && supplier.janitors.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-green-800 mb-2 flex items-center">
                                      <Users className="h-4 w-4 mr-2" />
                                      Janitors ({supplier.janitors.length})
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {supplier.janitors.map((janitor, index) => (
                                        <Card key={index} className="border-green-100 bg-green-50/50">
                                          <CardContent className="p-3">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <p className="font-medium text-green-900">{janitor.name || "Unnamed Janitor"}</p>
                                                <p className="text-sm text-green-700">{janitor.phone}</p>
                                                <p className="text-xs text-green-600">Account: {janitor.account}</p>
                                              </div>
                                              <Badge variant="outline" className="bg-white text-green-800 border-green-300">
                                                #{index + 1}
                                              </Badge>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery || regionFilter !== "all" || sectorFilter !== "all" 
                          ? "No suppliers match your search criteria." 
                          : "No suppliers found. Add your first supplier to get started."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] border-green-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-800">
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
            <DialogDescription className="text-green-600">
              {editingSupplier ? "Update supplier information" : "Add a new business supplier"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-green-800">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Company name"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_person" className="text-green-800">Contact Person *</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                  placeholder="Full name of contact person"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-green-800">Contact Phone *</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+251-911-000-000"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-green-800">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="contact@company.com"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-green-800">Company Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+251-111-000-000"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-green-800">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Physical address"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region_code" className="text-green-800">Region *</Label>
                <Select
                  value={formData.region_code}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, region_code: value }))}
                >
                  <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region.code} value={region.code} className="focus:bg-green-50">
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sector_code" className="text-green-800">Sector *</Label>
                <Select
                  value={formData.sector_code}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sector_code: value }))}
                >
                  <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map(sector => (
                      <SelectItem key={sector.code} value={sector.code} className="focus:bg-green-50">
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Janitors Section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-green-800">Janitors</Label>
                <Button type="button" variant="outline" size="sm" onClick={addJanitorField} className="border-green-300 text-green-700">
                  <Plus className="h-4 w-4 mr-1" /> Add Janitor
                </Button>
              </div>
              
              {formData.janitors?.map((janitor, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2 p-2 border border-green-100 rounded-md bg-green-50/30">
                  <div className="md:col-span-4">
                    <Input
                      placeholder="Janitor name"
                      value={janitor.name}
                      onChange={(e) => updateJanitorField(index, 'name', e.target.value)}
                      className="border-green-200"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Input
                      placeholder="Phone"
                      value={janitor.phone}
                      onChange={(e) => updateJanitorField(index, 'phone', e.target.value)}
                      className="border-green-200"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Input
                      placeholder="Account"
                      value={janitor.account}
                      onChange={(e) => updateJanitorField(index, 'account', e.target.value)}
                      className="border-green-200"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2 justify-end">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeJanitorField(index)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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
              onClick={handleSaveSupplier} 
              className="bg-green-600 hover:bg-green-700"
            >
              {editingSupplier ? "Update" : "Add"} Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-green-200">
          <DialogHeader>
            <DialogTitle className="text-green-800">Supplier Details</DialogTitle>
            <DialogDescription className="text-green-600">
              View detailed information about this supplier
            </DialogDescription>
          </DialogHeader>
          
          {viewingSupplier && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Company Name</Label>
                  <p className="text-green-900">{viewingSupplier.company_name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Contact Person</Label>
                  <p className="text-green-900">{viewingSupplier.contact_person}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Contact Phone</Label>
                  <p className="text-green-900">{viewingSupplier.contact_phone}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Contact Email</Label>
                  <p className="text-green-900">{viewingSupplier.contact_email || "N/A"}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Company Phone</Label>
                  <p className="text-green-900">{viewingSupplier.phone}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Location</Label>
                  <p className="text-green-900">{viewingSupplier.location}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Region</Label>
                  <p className="text-green-900">{viewingSupplier.region_name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Sector</Label>
                  <p className="text-green-900">{viewingSupplier.sector_name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Created Date</Label>
                  <p className="text-green-900">{formatDate(viewingSupplier.created_at)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-800 font-semibold">Last Updated</Label>
                  <p className="text-green-900">{formatDate(viewingSupplier.updated_at)}</p>
                </div>
              </div>
              
              {viewingSupplier.janitors && viewingSupplier.janitors.length > 0 && (
                <div className="mt-4">
                  <Label className="text-green-800 font-semibold">Janitors</Label>
                  <div className="mt-2 space-y-2">
                    {viewingSupplier.janitors.map((janitor, index) => (
                      <Card key={index} className="border-green-100">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-green-900">{janitor.name || "Unnamed Janitor"}</p>
                              <p className="text-sm text-green-700">{janitor.phone}</p>
                              <p className="text-xs text-green-600">Account: {janitor.account}</p>
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              #{index + 1}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-md border-green-200">
          <DialogHeader>
            <DialogTitle className="text-green-800">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-green-600">
              Are you sure you want to delete {deletingSupplier?.company_name}? This action cannot be undone.
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
              onClick={confirmDeleteSupplier} 
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