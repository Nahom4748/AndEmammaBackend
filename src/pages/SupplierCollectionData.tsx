import { useState, useEffect } from "react";
import axios from "axios";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, Building, Package, TrendingUp, Filter, Eye, Download } from "lucide-react";

interface SupplierCollectionData {
  supplier_id: number;
  supplier_name: string;
  last_collection_date: string | null;
  collected_in_last_3_months: "Yes" | "No";
  last_collection_type: "Regular" | "Instore" | "None";
  last_collection_kg: string | null;
  total_collections: number;
}

const SupplierCollectionStatus = () => {
  const [suppliers, setSuppliers] = useState<SupplierCollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [collectionTypeFilter, setCollectionTypeFilter] = useState<"all" | "regular" | "instore">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data from backend
  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/api/getSupplierCollectionSummary");
      
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
    fetchSupplierData();
  }, []);

  // Filter suppliers based on search term and filters
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && supplier.collected_in_last_3_months === "Yes") ||
      (statusFilter === "inactive" && supplier.collected_in_last_3_months === "No");
    const matchesCollectionType = collectionTypeFilter === "all" || 
      supplier.last_collection_type.toLowerCase() === collectionTypeFilter;

    return matchesSearch && matchesStatus && matchesCollectionType;
  });

  // Calculate metrics for dashboard cards
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.collected_in_last_3_months === "Yes").length;
  const inactiveSuppliers = suppliers.filter(s => s.collected_in_last_3_months === "No").length;
  const totalCollections = suppliers.reduce((sum, s) => sum + s.total_collections, 0);

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, collectionTypeFilter]);

  // Badge components
  const getCollectionStatusBadge = (status: "Yes" | "No") => {
    return status === "Yes" ? (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 px-2 py-1 text-xs">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 px-2 py-1 text-xs">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getCollectionTypeBadge = (type: "Regular" | "Instore" | "None") => {
    switch (type) {
      case "Regular":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 px-2 py-1 text-xs">Regular</Badge>;
      case "Instore":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 px-2 py-1 text-xs">In-Store</Badge>;
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

  const formatWeight = (weight: string | null) => {
    if (!weight) return 'N/A';
    return `${parseFloat(weight).toLocaleString()} kg`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-lg text-gray-600">Loading supplier data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
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
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Supplier Collection Dashboard</h1>
              <p className="text-sm text-gray-600">Monitor supplier collection activities and performance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={fetchSupplierData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{activeSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{inactiveSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Collections</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCollections}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters & Search
                </CardTitle>
                <CardDescription>Filter suppliers by status, type, or name</CardDescription>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredSuppliers.length} of {suppliers.length} suppliers
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Collection Type Filter */}
              <Select value={collectionTypeFilter} onValueChange={(value: "all" | "regular" | "instore") => setCollectionTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="regular">Regular Only</SelectItem>
                  <SelectItem value="instore">In-Store Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="px-3 py-1">
                  Status: {statusFilter === "active" ? "Active" : "Inactive"}
                  <button onClick={() => setStatusFilter("all")} className="ml-2 hover:text-red-500">×</button>
                </Badge>
              )}
              {collectionTypeFilter !== "all" && (
                <Badge variant="secondary" className="px-3 py-1">
                  Type: {collectionTypeFilter}
                  <button onClick={() => setCollectionTypeFilter("all")} className="ml-2 hover:text-red-500">×</button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="px-3 py-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-2 hover:text-red-500">×</button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modern Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-900 to-gray-800 hover:bg-gradient-to-r hover:from-gray-900 hover:to-gray-800">
                  <TableHead className="text-white font-semibold text-center">#</TableHead>
                  <TableHead className="text-white font-semibold">Supplier Information</TableHead>
                  <TableHead className="text-white font-semibold text-center">Status</TableHead>
                  <TableHead className="text-white font-semibold text-center">Last Collection</TableHead>
                  <TableHead className="text-white font-semibold text-center">Type</TableHead>
                  <TableHead className="text-white font-semibold text-center">Weight</TableHead>
                  <TableHead className="text-white font-semibold text-center">Total Collections</TableHead>
                  <TableHead className="text-white font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="text-gray-500 space-y-2">
                        <Search className="w-12 h-12 mx-auto opacity-50" />
                        <p className="font-medium">No suppliers found</p>
                        <p className="text-sm">Try adjusting your filters or search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentSuppliers.map((supplier, index) => (
                    <TableRow key={supplier.supplier_id} className="hover:bg-gray-50 even:bg-gray-50/50">
                      <TableCell className="text-center font-medium text-gray-600">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">{supplier.supplier_name}</div>
                          <div className="text-xs text-gray-500">ID: {supplier.supplier_id}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getCollectionStatusBadge(supplier.collected_in_last_3_months)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {formatDate(supplier.last_collection_date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getCollectionTypeBadge(supplier.last_collection_type)}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-gray-700">
                        {formatWeight(supplier.last_collection_kg)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {supplier.total_collections}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-white">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • {filteredSuppliers.length} suppliers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="hidden sm:flex"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0 text-xs"
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
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="hidden sm:flex"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SupplierCollectionStatus;