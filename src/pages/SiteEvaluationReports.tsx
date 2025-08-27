import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { SiteEvaluationForm } from "@/components/SiteEvaluationForm";
import { SiteEvaluationReport } from "@/types/site-evaluation";
import { Search, Plus, FileText, Download, Loader2, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import axios from 'axios';

// API base URL - adjust according to your backend
const API_BASE_URL = 'http://localhost:5000';

export default function SiteEvaluationReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<SiteEvaluationReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SiteEvaluationReport | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/site-evaluation-reports`);
      
      // Check if response has success property and data array
      if (response.data.success && Array.isArray(response.data.data)) {
        // Transform the API response to match our frontend structure
        const transformedReports = response.data.data.map((report: any) => ({
          id: report.id.toString(),
          supplierName: report.supplier_name,
          collectionCoordinator: report.collection_coordinator,
          startingDate: new Date(report.starting_date).toLocaleDateString(),
          endDate: new Date(report.end_date).toLocaleDateString(),
          collectionType: report.collection_type,
          collectedAmountKg: parseFloat(report.collected_amount_kg || 0),
          collectedAmountBagNumber: report.collected_amount_bag_number || 0,
          sw: parseFloat(report.sw || 0),
          sc: parseFloat(report.sc || 0),
          mixed: parseFloat(report.mixed || 0),
          carton: parseFloat(report.carton || 0),
          card: parseFloat(report.card || 0),
          newspaper: parseFloat(report.newspaper || 0),
          magazine: parseFloat(report.magazine || 0),
          plastic: parseFloat(report.plastic || 0),
          boxfile: parseFloat(report.boxfile || 0),
          metal: parseFloat(report.metal || 0),
          book: parseFloat(report.book || 0),
          averageKgPerBag: parseFloat(report.average_kg_per_bag || 0),
          costOfBagPerKg: parseFloat(report.cost_of_bag_per_kg || 0),
          costOfLabourPerKg: parseFloat(report.cost_of_labour_per_kg || 0),
          costOfTransportPerKg: parseFloat(report.cost_of_transport_per_kg || 0),
          qualityCheckedBy: report.quality_checked_by || '',
          qualityApprovedBy: report.quality_approved_by || '',
          customerFeedback: report.customer_feedback || '',
          keyOperationIssues: report.key_operation_issues || '',
          createdAt: report.created_at
        }));
        
        setReports(transformedReports);
      } else {
        console.error('Invalid API response structure:', response.data);
        toast({
          title: "Error",
          description: "Invalid data format received from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch site evaluation reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter(report =>
      report.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.collectionCoordinator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.collectionType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reports, searchQuery]);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchReports(); // Refresh the list after creating a new report
    toast({
      title: "Success",
      description: "Site evaluation report created successfully!",
    });
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/site-evaluation-reports/${id}`);
      toast({
        title: "Success",
        description: "Report deleted successfully!",
      });
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredReports.map(report => ({
      'Supplier Name': report.supplierName,
      'Collection Coordinator': report.collectionCoordinator,
      'Starting Date': report.startingDate,
      'End Date': report.endDate,
      'Collection Type': report.collectionType,
      'Collected Amount (kg)': report.collectedAmountKg,
      'Collected Amount (bags)': report.collectedAmountBagNumber,
      'Average kg/bag': report.averageKgPerBag,
      'Cost of Bag/kg': report.costOfBagPerKg,
      'Cost of Labour/kg': report.costOfLabourPerKg,
      'Cost of Transport/kg': report.costOfTransportPerKg,
      'Quality Checked By': report.qualityCheckedBy,
      'Quality Approved By': report.qualityApprovedBy,
      'Created At': new Date(report.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Site Evaluation Reports");
    
    XLSX.writeFile(workbook, `site_evaluation_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: "Site evaluation reports exported to Excel successfully!",
    });
  };

  const getStatusBadge = (report: SiteEvaluationReport) => {
    const totalCostPerKg = report.costOfBagPerKg + report.costOfLabourPerKg + report.costOfTransportPerKg;
    const efficiency = report.averageKgPerBag;
    
    if (efficiency >= 35 && totalCostPerKg <= 2.5) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>;
    } else if (efficiency >= 30 && totalCostPerKg <= 3) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Good</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Improvement</Badge>;
    }
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
            className={
              currentPage === i 
                ? "bg-green-600 text-white" 
                : "text-green-700 hover:bg-green-100"
            }
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Site Operation & Cost Evaluation Reports</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage collection site evaluation reports and performance metrics</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-green-800">Create Site Evaluation Report</DialogTitle>
            </DialogHeader>
            <SiteEvaluationForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-green-200">
        <CardHeader className="bg-green-50 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-green-800">Evaluation Reports ({filteredReports.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 w-full border-green-300 focus:border-green-500"
                />
              </div>
              <Button 
                onClick={exportToExcel} 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50 w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {paginatedReports.length > 0 ? (
                  paginatedReports.map((report) => (
                    <Card key={report.id} className="border-green-200">
                      <CardHeader className="bg-green-50 pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-green-800 text-base">{report.supplierName}</CardTitle>
                          {getStatusBadge(report)}
                        </div>
                        <p className="text-sm text-muted-foreground">{report.collectionCoordinator}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Period:</span> {report.startingDate} - {report.endDate}</div>
                          <div><span className="font-medium">Type:</span> 
                            <Badge 
                              variant="outline" 
                              className={
                                report.collectionType === 'sorted' 
                                  ? "ml-1 bg-green-100 text-green-800 border-green-200 text-xs" 
                                  : "ml-1 bg-amber-100 text-amber-800 border-amber-200 text-xs"
                              }
                            >
                              {report.collectionType}
                            </Badge>
                          </div>
                          <div><span className="font-medium">Amount:</span> {report.collectedAmountKg} kg</div>
                          <div><span className="font-medium">Efficiency:</span> {report.averageKgPerBag} kg/bag</div>
                          <div><span className="font-medium">Cost/kg:</span> 
                            <span className="font-semibold ml-1">
                              {(report.costOfBagPerKg + report.costOfLabourPerKg + report.costOfTransportPerKg).toFixed(2)} birr
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                                className="text-green-700 border-green-300 flex-1"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-green-800">Site Evaluation Report Details</DialogTitle>
                              </DialogHeader>
                              {selectedReport && (
                                <div className="space-y-6">
                                  {/* Information Section */}
                                  <Card className="border-green-200">
                                    <CardHeader className="bg-green-50">
                                      <CardTitle className="text-green-800">Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 gap-3 pt-4 text-sm">
                                      <div><strong>Supplier Name:</strong> {selectedReport.supplierName}</div>
                                      <div><strong>Collection Coordinator:</strong> {selectedReport.collectionCoordinator}</div>
                                      <div><strong>Starting Date:</strong> {selectedReport.startingDate}</div>
                                      <div><strong>End Date:</strong> {selectedReport.endDate}</div>
                                      <div><strong>Collection Type:</strong> {selectedReport.collectionType}</div>
                                    </CardContent>
                                  </Card>

                                  {/* Performance Section */}
                                  <Card className="border-green-200">
                                    <CardHeader className="bg-green-50">
                                      <CardTitle className="text-green-800">Performance & Bag Utilization</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-3 text-sm pt-4">
                                      <div><strong>Collected Amount:</strong> {selectedReport.collectedAmountKg} kg</div>
                                      <div><strong>Bag Number:</strong> {selectedReport.collectedAmountBagNumber}</div>
                                      <div><strong>Average kg/bag:</strong> {selectedReport.averageKgPerBag}</div>
                                      <div><strong>SW:</strong> {selectedReport.sw}</div>
                                      <div><strong>SC:</strong> {selectedReport.sc}</div>
                                      <div><strong>Mixed:</strong> {selectedReport.mixed}</div>
                                      <div><strong>Carton:</strong> {selectedReport.carton}</div>
                                      <div><strong>Card:</strong> {selectedReport.card}</div>
                                      <div><strong>Newspaper:</strong> {selectedReport.newspaper}</div>
                                      <div><strong>Magazine:</strong> {selectedReport.magazine}</div>
                                      <div><strong>Plastic:</strong> {selectedReport.plastic}</div>
                                      <div><strong>Book:</strong> {selectedReport.book}</div>
                                    </CardContent>
                                  </Card>

                                  {/* Cost Analysis */}
                                  <Card className="border-green-200">
                                    <CardHeader className="bg-green-50">
                                      <CardTitle className="text-green-800">Cost Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 gap-3 pt-4 text-sm">
                                      <div><strong>Labour Cost/kg:</strong> {selectedReport.costOfLabourPerKg} birr</div>
                                      <div><strong>Transport Cost/kg:</strong> {selectedReport.costOfTransportPerKg} birr</div>
                                      <div><strong>Bag Cost/kg:</strong> {selectedReport.costOfBagPerKg} birr</div>
                                      <div className="font-semibold text-green-700"><strong>Total Cost/kg:</strong> {(selectedReport.costOfBagPerKg + selectedReport.costOfLabourPerKg + selectedReport.costOfTransportPerKg).toFixed(2)} birr</div>
                                    </CardContent>
                                  </Card>

                                  {/* Quality & Feedback */}
                                  <Card className="border-green-200">
                                    <CardHeader className="bg-green-50">
                                      <CardTitle className="text-green-800">Quality & Feedback</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 pt-4 text-sm">
                                      <div><strong>Quality Checked By:</strong> {selectedReport.qualityCheckedBy}</div>
                                      <div><strong>Quality Approved By:</strong> {selectedReport.qualityApprovedBy}</div>
                                      {selectedReport.customerFeedback && (
                                        <div><strong>Customer Feedback:</strong> {selectedReport.customerFeedback}</div>
                                      )}
                                      {selectedReport.keyOperationIssues && (
                                        <div><strong>Key Operation Issues:</strong> {selectedReport.keyOperationIssues}</div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 border-red-300 flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No site evaluation reports found.
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-green-50">
                      <TableHead className="text-green-800">Supplier</TableHead>
                      <TableHead className="text-green-800">Coordinator</TableHead>
                      <TableHead className="text-green-800">Period</TableHead>
                      <TableHead className="text-green-800">Type</TableHead>
                      <TableHead className="text-green-800">Amount (kg)</TableHead>
                      <TableHead className="text-green-800">Efficiency</TableHead>
                      <TableHead className="text-green-800">Total Cost/kg</TableHead>
                      <TableHead className="text-green-800">Status</TableHead>
                      <TableHead className="text-green-800">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReports.length > 0 ? (
                      paginatedReports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-green-50 border-green-100">
                          <TableCell className="font-medium">{report.supplierName}</TableCell>
                          <TableCell>{report.collectionCoordinator}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{report.startingDate}</div>
                              <div className="text-muted-foreground">to {report.endDate}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                report.collectionType === 'sorted' 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-amber-100 text-amber-800 border-amber-200"
                              }
                            >
                              {report.collectionType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{report.collectedAmountKg} kg</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{report.averageKgPerBag} kg/bag</div>
                              <div className="text-muted-foreground">
                                {report.collectedAmountBagNumber} bags
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {(report.costOfBagPerKg + report.costOfLabourPerKg + report.costOfTransportPerKg).toFixed(2)} birr/kg
                          </TableCell>
                          <TableCell>{getStatusBadge(report)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog open={isViewDialogOpen && selectedReport?.id === report.id} onOpenChange={(open) => {
                                setIsViewDialogOpen(open);
                                if (!open) setSelectedReport(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedReport(report)}
                                    className="text-green-700 hover:bg-green-100"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-green-800">Site Evaluation Report Details</DialogTitle>
                                  </DialogHeader>
                                  {selectedReport && (
                                    <div className="space-y-6">
                                      {/* Information Section */}
                                      <Card className="border-green-200">
                                        <CardHeader className="bg-green-50">
                                          <CardTitle className="text-green-800">Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 gap-4 pt-6">
                                          <div><strong>Supplier Name:</strong> {selectedReport.supplierName}</div>
                                          <div><strong>Collection Coordinator:</strong> {selectedReport.collectionCoordinator}</div>
                                          <div><strong>Starting Date:</strong> {selectedReport.startingDate}</div>
                                          <div><strong>End Date:</strong> {selectedReport.endDate}</div>
                                          <div><strong>Collection Type:</strong> {selectedReport.collectionType}</div>
                                        </CardContent>
                                      </Card>

                                      {/* Performance Section */}
                                      <Card className="border-green-200">
                                        <CardHeader className="bg-green-50">
                                          <CardTitle className="text-green-800">Performance & Bag Utilization</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pt-6">
                                          <div><strong>Collected Amount:</strong> {selectedReport.collectedAmountKg} kg</div>
                                          <div><strong>Bag Number:</strong> {selectedReport.collectedAmountBagNumber}</div>
                                          <div><strong>Average kg/bag:</strong> {selectedReport.averageKgPerBag}</div>
                                          <div><strong>SW:</strong> {selectedReport.sw}</div>
                                          <div><strong>SC:</strong> {selectedReport.sc}</div>
                                          <div><strong>Mixed:</strong> {selectedReport.mixed}</div>
                                          <div><strong>Carton:</strong> {selectedReport.carton}</div>
                                          <div><strong>Card:</strong> {selectedReport.card}</div>
                                          <div><strong>Newspaper:</strong> {selectedReport.newspaper}</div>
                                          <div><strong>Magazine:</strong> {selectedReport.magazine}</div>
                                          <div><strong>Plastic:</strong> {selectedReport.plastic}</div>
                                          <div><strong>Book:</strong> {selectedReport.book}</div>
                                        </CardContent>
                                      </Card>

                                      {/* Cost Analysis */}
                                      <Card className="border-green-200">
                                        <CardHeader className="bg-green-50">
                                          <CardTitle className="text-green-800">Cost Analysis</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                                          <div><strong>Labour Cost/kg:</strong> {selectedReport.costOfLabourPerKg} birr</div>
                                          <div><strong>Transport Cost/kg:</strong> {selectedReport.costOfTransportPerKg} birr</div>
                                          <div><strong>Bag Cost/kg:</strong> {selectedReport.costOfBagPerKg} birr</div>
                                          <div className="font-semibold text-green-700"><strong>Total Cost/kg:</strong> {(selectedReport.costOfBagPerKg + selectedReport.costOfLabourPerKg + selectedReport.costOfTransportPerKg).toFixed(2)} birr</div>
                                        </CardContent>
                                      </Card>

                                      {/* Quality & Feedback */}
                                      <Card className="border-green-200">
                                        <CardHeader className="bg-green-50">
                                          <CardTitle className="text-green-800">Quality & Feedback</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 pt-6">
                                          <div><strong>Quality Checked By:</strong> {selectedReport.qualityCheckedBy}</div>
                                          <div><strong>Quality Approved By:</strong> {selectedReport.qualityApprovedBy}</div>
                                          {selectedReport.customerFeedback && (
                                            <div><strong>Customer Feedback:</strong> {selectedReport.customerFeedback}</div>
                                          )}
                                          {selectedReport.keyOperationIssues && (
                                            <div><strong>Key Operation Issues:</strong> {selectedReport.keyOperationIssues}</div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReport(report.id)}
                                className="text-red-600 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No site evaluation reports found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "text-green-700 hover:bg-green-100"}
                      />
                    </PaginationItem>
                    {getPaginationItems()}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "text-green-700 hover:bg-green-100"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}