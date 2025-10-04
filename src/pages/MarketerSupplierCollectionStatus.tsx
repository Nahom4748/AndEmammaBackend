import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/components/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, Package, Filter, Eye, User, Weight, Activity } from "lucide-react";

interface MarketerSupplierData {
  supplierName: string;
  performance: {
    lastCollectionDate: string | null;
    lastCollectionType: "Regular" | "Instore" | "None";
    lastCollectionKg: string;
    totalCollections: number;
    totalCollectedKg: string;
    status: "Active" | "Inactive";
  };
}

const MarketerSupplierCollectionStatus = () => {
  const { user } = useAuth();
  const userId = user?.user_id;
  
  const [suppliers, setSuppliers] = useState<MarketerSupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch data from backend
  const fetchSupplierData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/getMarketerSuppliersWithPerformance/${userId}`);
      
      if (response.data.status === "success") {
        setSuppliers(response.data.data);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching supplier data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSupplierData();
    }
  }, [userId]);

  // Filter suppliers based on search term and status filter
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && supplier.performance.status === "Active") ||
      (statusFilter === "inactive" && supplier.performance.status === "Inactive");

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics for dashboard cards
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.performance.status === "Active").length;
  const totalCollections = suppliers.reduce((sum, s) => sum + s.performance.totalCollections, 0);
  const totalCollectedKg = suppliers.reduce((sum, s) => sum + parseFloat(s.performance.totalCollectedKg || "0"), 0);

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Badge components
  const getStatusBadge = (status: "Active" | "Inactive") => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-800 border-green-200 px-2 py-1 text-xs">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 px-2 py-1 text-xs">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getCollectionTypeBadge = (type: "Regular" | "Instore" | "None") => {
    switch (type) {
      case "Regular":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-1 text-xs">Regular</Badge>;
      case "Instore":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-2 py-1 text-xs">In-Store</Badge>;
      default:
        return <Badge variant="outline" className="px-2 py-1 text-xs">None</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWeight = (weight: string) => {
    if (!weight || weight === "0.00") return 'N/A';
    return `${parseFloat(weight).toLocaleString()} kg`;
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600 flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription>Please log in to view your supplier dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-lg text-gray-600">Loading your suppliers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600 flex items-center justify-center gap-2">
              <XCircle className="h-5 w-5" />
              Error Loading Data
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchSupplierData} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Suppliers</h1>
              <p className="text-sm text-gray-600">Monitor your assigned suppliers' collection activities</p>
            </div>
          </div>
          <Button onClick={fetchSupplierData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-white border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-lg font-bold text-gray-900">{totalSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-lg font-bold text-gray-900">{activeSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-purple-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Collections</p>
                  <p className="text-lg font-bold text-gray-900">{totalCollections}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-orange-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Weight className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Weight</p>
                  <p className="text-lg font-bold text-gray-900">{totalCollectedKg.toLocaleString()} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
                <CardDescription>Filter your suppliers</CardDescription>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredSuppliers.length} of {suppliers.length} suppliers
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="px-2 py-1 text-xs">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("all")} className="ml-1">×</button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="px-2 py-1 text-xs">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-1">×</button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card className="bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-900 to-gray-800">
                  <TableHead className="text-white font-semibold text-center text-xs sm:text-sm">#</TableHead>
                  <TableHead className="text-white font-semibold text-xs sm:text-sm">Supplier</TableHead>
                  <TableHead className="text-white font-semibold text-center text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-white font-semibold text-center text-xs sm:text-sm hidden sm:table-cell">Last Collection</TableHead>
                  <TableHead className="text-white font-semibold text-center text-xs sm:text-sm hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-white font-semibold text-center text-xs sm:text-sm">Collections</TableHead>
                  <TableHead className="text-white font-semibold text-center text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500 space-y-2">
                        <Search className="w-8 h-8 mx-auto opacity-50" />
                        <p className="font-medium">No suppliers found</p>
                        <p className="text-xs">Try adjusting your filters or search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentSuppliers.map((supplier, index) => (
                    <TableRow key={supplier.supplierName} className="hover:bg-gray-50 even:bg-gray-50/50">
                      <TableCell className="text-center font-medium text-gray-600 text-xs sm:text-sm">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 text-sm">{supplier.supplierName}</div>
                          <div className="text-xs text-gray-500">
                            Total: {formatWeight(supplier.performance.totalCollectedKg)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(supplier.performance.status)}
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-700">
                            {formatDate(supplier.performance.lastCollectionDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        {getCollectionTypeBadge(supplier.performance.lastCollectionType)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {supplier.performance.totalCollections}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t bg-white">
              <div className="text-xs text-gray-600">
                Page {currentPage} of {totalPages} • {filteredSuppliers.length} suppliers
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage === 1) {
                      pageNum = i + 1;
                    } else if (currentPage === totalPages) {
                      pageNum = totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MarketerSupplierCollectionStatus;