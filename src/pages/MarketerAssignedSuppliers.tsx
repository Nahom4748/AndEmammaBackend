import { useState, useEffect } from "react";
import { useAuth } from "@/components/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  User, 
  Phone, 
  RefreshCw,
  Building2,
  Calendar,
  Clock,
  AlertCircle,
  Menu,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  PhoneCall
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface HistoryItem {
  id: number;
  details: string;
  createdAt: string;
}

interface Plan {
  id: number;
  visitDate: string;
  type: string;
  notes: string | null;
  status: string;
  marketerId: number;
}

interface Marketer {
  id: number;
  name: string;
}

interface Supplier {
  supplierId: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  location: string;
  region: string;
  sector: string;
  marketer: Marketer;
  history: HistoryItem[];
  lastPlan: Plan | null;
}

export const MarketerAssignedSuppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Fetch assigned suppliers for the current marketer
  const fetchAssignedSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/marketers/${user?.user_id}/suppliers`);
      if (response.data.status === "success") {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch assigned suppliers");
      console.error("Error fetching assigned suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchAssignedSuppliers();
    }
  }, [user]);

  // Filter suppliers based on search term and filters
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = searchTerm === "" || 
      supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "hasPlan" && supplier.lastPlan) ||
      (statusFilter === "noPlan" && !supplier.lastPlan);
    
    const matchesSector = sectorFilter === "all" || 
      supplier.sector === sectorFilter;
    
    return matchesSearch && matchesStatus && matchesSector;
  });

  // Get unique sectors for filter
  const uniqueSectors = [...new Set(suppliers.map(s => s.sector))];

  // Pagination logic
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const getSectorIcon = (sector: string) => {
    const sectorIcons: Record<string, JSX.Element> = {
      "Car & Airline": <Building2 className="h-4 w-4" />,
      "Addis Ababa": <Building2 className="h-4 w-4" />,
      "Group & Cement": <Building2 className="h-4 w-4" />,
      "Federal": <Building2 className="h-4 w-4" />,
      "Bank": <Building2 className="h-4 w-4" />,
      "NGO": <Building2 className="h-4 w-4" />,
      "Real Estate & Contractor": <Building2 className="h-4 w-4" />,
    };
    return sectorIcons[sector] || <Building2 className="h-4 w-4" />;
  };

  const getLatestHistory = (history: HistoryItem[]) => {
    if (history.length === 0) return null;
    // Sort by date to get the latest history
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedHistory[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPlanStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const openSupplierModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin mb-4" />
            <p>Loading assigned suppliers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-50">
      {/* Mobile Header with Filter Button */}
      <div className="md:hidden p-4 border-b bg-white flex items-center justify-between shadow-sm sticky top-0 z-10">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-800">Assigned Suppliers</h1>
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        bg-white p-4 border-r w-full md:w-64 md:block shadow-lg fixed md:static h-full z-20
        ${sidebarOpen ? 'block' : 'hidden'}
        transition-all duration-300 ease-in-out
      `}>
        <div className="space-y-6">
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Assigned Suppliers</h2>
            <p className="text-sm text-gray-600">
              Overview of your assigned suppliers with plans and history
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Filters</h3>
            
            <div className="space-y-2">
              <Label className="text-gray-600">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search suppliers..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-600">Plan Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="hasPlan">Has Plan</SelectItem>
                  <SelectItem value="noPlan">No Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-600">Sector</Label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {uniqueSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={fetchAssignedSuppliers}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        <Card className="w-full shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                  My Assigned Suppliers
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Overview of suppliers assigned to you with their history and plans
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchAssignedSuppliers} className="hidden md:flex">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="icon" onClick={fetchAssignedSuppliers} className="md:hidden">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No suppliers found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {suppliers.length === 0 
                    ? "You don't have any suppliers assigned to you yet." 
                    : "No suppliers match your current filters."}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">Supplier Details</TableHead>
                        <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Sector</TableHead>
                        <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Contact</TableHead>
                        <TableHead className="font-semibold text-gray-700">Latest Plan</TableHead>
                        <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSuppliers.map((supplier) => {
                        const latestHistory = getLatestHistory(supplier.history);
                        return (
                          <TableRow key={supplier.supplierId} className="hover:bg-gray-50/80">
                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div 
                                  className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
                                  onClick={() => openSupplierModal(supplier)}
                                >
                                  {supplier.companyName}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{supplier.location}</span>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">{supplier.region}</Badge>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell py-4">
                              <div className="flex items-center gap-2">
                                {getSectorIcon(supplier.sector)}
                                <span className="text-sm text-gray-700">{supplier.sector}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-gray-900">
                                  <User className="h-3.5 w-3.5" />
                                  {supplier.contactPerson}
                                </div>
                                <div 
                                  className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer hover:underline"
                                  onClick={() => handleCall(supplier.phone)}
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                  {supplier.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {supplier.lastPlan ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-800">
                                      {formatDate(supplier.lastPlan.visitDate)}
                                    </span>
                                  </div>
                                  <div>
                                    {getPlanStatusBadge(supplier.lastPlan.status)}
                                  </div>
                                  {supplier.lastPlan.type && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Type: {supplier.lastPlan.type}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-start gap-1.5">
                                  <div className="flex items-center gap-1.5 text-amber-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">No plan yet</span>
                                  </div>
                                  <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                    Not scheduled
                                  </Badge>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openSupplierModal(supplier)}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCall(supplier.phone)}
                                  className="h-8 w-8"
                                >
                                  <PhoneCall className="h-4 w-4 text-blue-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 border-t">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSuppliers.length)} of {filteredSuppliers.length} suppliers
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
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
                              className="h-8 w-8 p-0"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Supplier Detail Modal */}
      {isModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Supplier Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Company Name</Label>
                    <p className="font-medium">{selectedSupplier.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Sector</Label>
                    <div className="flex items-center gap-2">
                      {getSectorIcon(selectedSupplier.sector)}
                      <span>{selectedSupplier.sector}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Region</Label>
                    <p>{selectedSupplier.region}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Location</Label>
                    <p>{selectedSupplier.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Contact Person</Label>
                    <p className="font-medium">{selectedSupplier.contactPerson}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Phone Number</Label>
                    <div 
                      className="flex items-center gap-2 text-blue-600 cursor-pointer hover:underline"
                      onClick={() => handleCall(selectedSupplier.phone)}
                    >
                      <Phone className="h-4 w-4" />
                      <span>{selectedSupplier.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Latest Plan</h3>
                {selectedSupplier.lastPlan ? (
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{formatDate(selectedSupplier.lastPlan.visitDate)}</span>
                      </div>
                      {getPlanStatusBadge(selectedSupplier.lastPlan.status)}
                    </div>
                    {selectedSupplier.lastPlan.type && (
                      <p className="text-sm">Type: {selectedSupplier.lastPlan.type}</p>
                    )}
                    {selectedSupplier.lastPlan.notes && (
                      <p className="text-sm">Notes: {selectedSupplier.lastPlan.notes}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No plan available</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Recent History</h3>
                {selectedSupplier.history.length > 0 ? (
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {selectedSupplier.history.map((historyItem) => (
                      <div key={historyItem.id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm">{historyItem.details}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(historyItem.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No history available</p>
                )}
              </div>
            </div>
            <div className="flex justify-end p-6 border-t gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => handleCall(selectedSupplier.phone)}
                className="flex items-center gap-2"
              >
                <PhoneCall className="h-4 w-4" />
                Call {selectedSupplier.contactPerson}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};