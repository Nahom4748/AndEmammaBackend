import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Heart, UserCheck, UserX, Download, Trash2, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import * as XLSX from "xlsx";

interface Mama {
  id: number;
  fullName: string;
  woreda: string;
  phone: string;
  joinDate: string;
  accountNumber: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE_URL = "http://localhost:5000";

export default function MamasManagement() {
  const [mamas, setMamas] = useState<Mama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMama, setEditingMama] = useState<Mama | null>(null);
  const [deletingMama, setDeletingMama] = useState<Mama | null>(null);
  const [formData, setFormData] = useState<Partial<Mama>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch mamas from backend
  useEffect(() => {
    const fetchMamas = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/mamas`);
        
        if (response.data.status === "success") {
          setMamas(response.data.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch mamas data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching mamas:", error);
        toast({
          title: "Error",
          description: "Failed to fetch mamas data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMamas();
  }, [toast]);

  const handleAddMama = () => {
    setEditingMama(null);
    setFormData({
      status: "active",
      joinDate: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleEditMama = (mama: Mama) => {
    setEditingMama(mama);
    setFormData({
      ...mama,
      joinDate: mama.joinDate.split('T')[0] // Format date for input field
    });
    setIsDialogOpen(true);
  };

  const handleDeleteMama = (mama: Mama) => {
    setDeletingMama(mama);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteMama = async () => {
    if (!deletingMama) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/mamas/${deletingMama.id}`);
      
      if (response.data.status === "success") {
        setMamas(prev => prev.filter(mama => mama.id !== deletingMama.id));
        toast({
          title: "Success",
          description: "Mama deleted successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete mama");
      }
    } catch (error) {
      console.error("Error deleting mama:", error);
      toast({
        title: "Error",
        description: "Failed to delete mama",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingMama(null);
    }
  };

  const handleSaveMama = async () => {
    if (!formData.fullName || !formData.woreda || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingMama) {
        // Update existing mama
        const response = await axios.put(`${API_BASE_URL}/mamas/${editingMama.id}`, formData);
        
        if (response.data.status === "success") {
          setMamas(prev => prev.map(mama => 
            mama.id === editingMama.id 
              ? response.data.data
              : mama
          ));
          toast({
            title: "Success",
            description: "Mama updated successfully",
          });
        } else {
          throw new Error(response.data.message || "Failed to update mama");
        }
      } else {
        // Create new mama
        const response = await axios.post(`${API_BASE_URL}/mamas`, formData);
        
        if (response.data.status === "success") {
          setMamas(prev => [...prev, response.data.data]);
          toast({
            title: "Success",
            description: "Member created successfully",
          });
        } else {
          throw new Error(response.data.message || "Failed to add mama");
        }
      }
      
      setIsDialogOpen(false);
      setFormData({});
    } catch (error) {
      console.error("Error saving mama:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingMama ? 'update' : 'add'} mama`,
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    // Prepare data for Excel export
    const excelData = mamas.map(mama => ({
      "Full Name": mama.fullName,
      "Woreda": mama.woreda,
      "Phone": mama.phone,
      "Join Date": new Date(mama.joinDate).toLocaleDateString(),
      "Account Number": mama.accountNumber,
      "Status": mama.status,
      "Created At": mama.createdAt ? new Date(mama.createdAt).toLocaleDateString() : "",
      "Updated At": mama.updatedAt ? new Date(mama.updatedAt).toLocaleDateString() : ""
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mamas Data");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `mamas-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Success",
      description: "Excel file downloaded successfully",
    });
  };

  // Filter mamas based on search query
  const filteredMamas = mamas.filter(mama => 
    mama.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mama.woreda.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mama.phone.includes(searchQuery) ||
    mama.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMamas = mamas.filter(mama => mama.status === "active").length;
  const inactiveMamas = mamas.filter(mama => mama.status === "inactive").length;

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-green-700">Mamas Management</h1>
          <p className="text-green-600 mt-2">Manage community collection partners</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button 
            onClick={exportToExcel} 
            variant="outline" 
            className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button 
            onClick={handleAddMama} 
            className="bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Mama
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Mamas</CardTitle>
            <Heart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{mamas.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Mamas</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{activeMamas}</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Inactive Mamas</CardTitle>
            <UserX className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{inactiveMamas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mamas Table */}
      <Card className="border-green-200">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-green-800">Mamas List</CardTitle>
            <CardDescription className="text-green-600">Community collection partners and their information</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mamas..."
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
                  <TableHead className="text-green-800">Full Name</TableHead>
                  <TableHead className="text-green-800">Woreda</TableHead>
                  <TableHead className="text-green-800">Phone</TableHead>
                  <TableHead className="text-green-800">Join Date</TableHead>
                  <TableHead className="text-green-800">Account Number</TableHead>
                  <TableHead className="text-green-800">Status</TableHead>
                  <TableHead className="text-green-800 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMamas.length > 0 ? (
                  filteredMamas.map((mama) => (
                    <TableRow key={mama.id} className="hover:bg-green-50/50">
                      <TableCell className="font-medium text-green-900">{mama.fullName}</TableCell>
                      <TableCell className="text-green-800">{mama.woreda}</TableCell>
                      <TableCell className="text-green-800">{mama.phone}</TableCell>
                      <TableCell className="text-green-800">
                        {new Date(mama.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-green-800">{mama.accountNumber}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={mama.status === "active" ? "default" : "secondary"}
                          className={mama.status === "active" 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }
                        >
                          {mama.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMama(mama)}
                            className="border-green-300 text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMama(mama)}
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No mamas match your search." : "No mamas found. Add your first mama to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Mama Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] border-green-200">
          <DialogHeader>
            <DialogTitle className="text-green-800">
              {editingMama ? "Edit Mama" : "Add New Mama"}
            </DialogTitle>
            <DialogDescription className="text-green-600">
              {editingMama ? "Update mama information" : "Add a new community collection partner"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-green-800">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Full legal name"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="woreda" className="text-green-800">Woreda *</Label>
                <Input
                  id="woreda"
                  value={formData.woreda || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, woreda: e.target.value }))}
                  placeholder="Woreda name"
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
                <Label htmlFor="accountNumber" className="text-green-800">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="MAMA-XXX-2024"
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
              onClick={handleSaveMama} 
              className="bg-green-600 hover:bg-green-700"
            >
              {editingMama ? "Update" : "Add"} Mama
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
              Are you sure you want to delete {deletingMama?.fullName}? This action cannot be undone.
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
              onClick={confirmDeleteMama} 
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