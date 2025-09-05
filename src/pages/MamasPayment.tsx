import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, Calculator, FileSpreadsheet, ChevronDown, ChevronUp, User, Coins, CalendarDays, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import * as XLSX from 'xlsx';

interface Product {
  productId: number;
  productName: string;
  type: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  notes: string;
}

interface MamaDayEntry {
  mamaId: number;
  fullName: string;
  accountNumber: string;
  date: string;
  products: Product[];
  grandTotal: number;
}

interface MamaPayment {
  mamaId: number;
  mamaName: string;
  accountNumber: string;
  totalWithTube: number;
  totalWithoutTube: number;
  totalQuantity: number;
  totalAmount: number;
  workingDays: number;
  details: MamaDayEntry[];
}

const MamasPayment = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [payments, setPayments] = useState<MamaPayment[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedMama, setExpandedMama] = useState<number | null>(null);

  // Set default date range to current month on component mount
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDayOfMonth);
    setEndDate(today);
  }, []);

  const calculatePayments = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: "Start date must be before end date",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // This would be your actual API endpoint
      const response = await axios.get('/api/mamas/payments', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });

      // Transform the API data to our UI format
      const transformedData = transformApiData(response.data.data);
      setPayments(transformedData);
      setIsCalculated(true);

      toast({
        title: "Success",
        description: `Calculated payments for ${transformedData.length} mamas`,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const transformApiData = (apiData: MamaDayEntry[]): MamaPayment[] => {
    const mamaMap = new Map<number, MamaPayment>();
    
    apiData.forEach(entry => {
      if (!mamaMap.has(entry.mamaId)) {
        mamaMap.set(entry.mamaId, {
          mamaId: entry.mamaId,
          mamaName: entry.fullName,
          accountNumber: entry.accountNumber,
          totalWithTube: 0,
          totalWithoutTube: 0,
          totalQuantity: 0,
          totalAmount: 0,
          workingDays: 0,
          details: []
        });
      }
      
      const mamaPayment = mamaMap.get(entry.mamaId)!;
      mamaPayment.details.push(entry);
      
      // Calculate product totals
      entry.products.forEach(product => {
        if (product.type === 'withTube') {
          mamaPayment.totalWithTube += product.quantity;
        } else if (product.type === 'withoutTube') {
          mamaPayment.totalWithoutTube += product.quantity;
        }
        
        mamaPayment.totalQuantity += product.quantity;
        mamaPayment.totalAmount += parseFloat(product.totalAmount);
      });
      
      mamaPayment.workingDays = new Set(mamaPayment.details.map(d => d.date)).size;
    });
    
    return Array.from(mamaMap.values());
  };

  const exportToExcel = () => {
    if (!isCalculated || payments.length === 0) {
      toast({
        title: "Error",
        description: "Please calculate payments first",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      // Create workbook and worksheets
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet with only mama name, account number, and total payment
      const summaryData = [
        ["Mamas Payment Report"],
        [`Period: ${startDate ? format(startDate, "dd/MM/yyyy") : ""} to ${endDate ? format(endDate, "dd/MM/yyyy") : ""}`],
        [],
        ["Mama Name", "Account Number", "Total Payment (Birr)"],
        ...payments.map(payment => [
          payment.mamaName,
          payment.accountNumber,
          payment.totalAmount
        ]),
        [],
        ["Total", "", payments.reduce((sum, p) => sum + p.totalAmount, 0)]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Payment Summary");
      
      // Export the workbook
      const fileName = `Mamas_Payment_Report_${format(startDate!, "yyyy_MM_dd")}_to_${format(endDate!, "yyyy_MM_dd")}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Success",
        description: "Payment report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleMamaDetails = (mamaId: number) => {
    if (expandedMama === mamaId) {
      setExpandedMama(null);
    } else {
      setExpandedMama(mamaId);
    }
  };

  const totalPayment = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
  const activeMamas = payments.filter(p => p.totalQuantity > 0).length;
  const totalProducts = payments.reduce((sum, p) => sum + p.totalQuantity, 0);
  const totalWithTube = payments.reduce((sum, p) => sum + p.totalWithTube, 0);
  const totalWithoutTube = payments.reduce((sum, p) => sum + p.totalWithoutTube, 0);
  const totalWorkingDays = payments.reduce((sum, p) => sum + p.workingDays, 0);

  // Skeleton components for loading state
  const SummarySkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <Skeleton className="h-7 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const TableSkeleton = () => (
    <div className="space-y-3 p-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Coins className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mamas Payment Dashboard</h1>
              <p className="text-gray-600 text-sm">Calculate and manage payments for mamas</p>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="bg-green-50 rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
              <CalendarDays className="h-5 w-5" />
              Select Payment Period
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white text-sm h-10",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PP") : <span>Start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white text-sm h-10",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PP") : <span>End date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button 
                onClick={calculatePayments} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 h-10 text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Payments
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {isLoading && <SummarySkeleton />}
        
        {isCalculated && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{payments.length}</div>
                    <p className="text-sm text-gray-600">Total Mamas</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{activeMamas}</div>
                    <p className="text-sm text-gray-600">Active Workers</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{totalProducts}</div>
                    <p className="text-sm text-gray-600">Total Products</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{totalPayment.toLocaleString()}</div>
                    <p className="text-sm text-gray-600">Total Payment (Birr)</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Coins className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        {isCalculated && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{totalWithTube}</div>
                    <p className="text-sm opacity-90">With Tube Products</p>
                  </div>
                  <Package className="h-7 w-7 opacity-90" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{totalWithoutTube}</div>
                    <p className="text-sm opacity-90">Without Tube Products</p>
                  </div>
                  <Package className="h-7 w-7 opacity-90" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{totalWorkingDays}</div>
                    <p className="text-sm opacity-90">Total Working Days</p>
                  </div>
                  <CalendarDays className="h-7 w-7 opacity-90" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Table */}
        {isCalculated && (
          <Card className="shadow-sm border-0 overflow-hidden bg-white">
            <CardHeader className="bg-green-50 rounded-t-lg py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-green-800 text-lg">Payment Details</CardTitle>
                <Button 
                  onClick={exportToExcel} 
                  variant="outline"
                  disabled={isExporting}
                  className="bg-white border-green-200 text-green-700 hover:bg-green-50 text-sm h-9"
                >
                  {isExporting ? (
                    <>
                      <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export to Excel
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-green-50 hover:bg-green-50">
                        <TableHead className="font-semibold text-green-800 py-3">Mama Name</TableHead>
                        <TableHead className="text-center font-semibold text-green-800 py-3">With Tube</TableHead>
                        <TableHead className="text-center font-semibold text-green-800 py-3">Without Tube</TableHead>
                        <TableHead className="text-center font-semibold text-green-800 py-3">Total Qty</TableHead>
                        <TableHead className="text-center font-semibold text-green-800 py-3">Working Days</TableHead>
                        <TableHead className="text-right font-semibold text-green-800 py-3">Total Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <React.Fragment key={payment.mamaId}>
                          <TableRow 
                            className="cursor-pointer hover:bg-green-50" 
                            onClick={() => toggleMamaDetails(payment.mamaId)}
                          >
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-medium text-gray-900">{payment.mamaName}</div>
                                  <div className="text-xs text-gray-500">{payment.accountNumber}</div>
                                </div>
                                {payment.totalQuantity > 0 ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Active</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500 text-xs">Inactive</Badge>
                                )}
                                {expandedMama === payment.mamaId ? (
                                  <ChevronUp className="h-4 w-4 text-green-600 ml-auto" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-green-600 ml-auto" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-3 font-medium">
                              {payment.totalWithTube}
                            </TableCell>
                            <TableCell className="text-center py-3 font-medium">
                              {payment.totalWithoutTube}
                            </TableCell>
                            <TableCell className="text-center py-3 font-medium">
                              {payment.totalQuantity}
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <Badge variant={payment.workingDays > 0 ? "default" : "secondary"} 
                                className={payment.workingDays > 0 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                                {payment.workingDays} days
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right py-3 font-bold text-green-700">
                              {payment.totalAmount.toLocaleString()} Birr
                            </TableCell>
                          </TableRow>
                          {expandedMama === payment.mamaId && (
                            <TableRow className="bg-green-50">
                              <TableCell colSpan={6} className="p-4">
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-green-800 text-lg border-b pb-2">Production Details</h4>
                                  {payment.details.map((detail, index) => (
                                    <Card key={index} className="bg-white border-green-100">
                                      <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                                          <span className="font-medium text-gray-700">
                                            {format(new Date(detail.date), "PPP")}
                                          </span>
                                          <Badge className="bg-green-100 text-green-800 w-fit">
                                            Total: {detail.grandTotal.toLocaleString()} Birr
                                          </Badge>
                                        </div>
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-sm">
                                            <thead>
                                              <tr className="border-b">
                                                <th className="text-left pb-2 text-green-800">Product</th>
                                                <th className="text-left pb-2 text-green-800">Type</th>
                                                <th className="text-right pb-2 text-green-800">Qty</th>
                                                <th className="text-right pb-2 text-green-800">Unit Price</th>
                                                <th className="text-right pb-2 text-green-800">Amount</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {detail.products.map((product, pIndex) => (
                                                <tr key={pIndex} className="border-b border-green-50 last:border-b-0">
                                                  <td className="py-2 text-gray-900">{product.productName}</td>
                                                  <td className="py-2">
                                                    <Badge variant="outline" className={
                                                      product.type === 'withTube' 
                                                        ? "bg-purple-100 text-purple-800 text-xs" 
                                                        : "bg-blue-100 text-blue-800 text-xs"
                                                    }>
                                                      {product.type}
                                                    </Badge>
                                                  </td>
                                                  <td className="py-2 text-right">{product.quantity}</td>
                                                  <td className="py-2 text-right">{product.unitPrice} Birr</td>
                                                  <td className="py-2 text-right font-medium">{product.totalAmount} Birr</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                        {detail.products.some(p => p.notes) && (
                                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                            <h5 className="font-medium text-sm text-gray-700 mb-1">Notes:</h5>
                                            <div className="text-sm text-gray-600">
                                              {detail.products.filter(p => p.notes).map((p, i) => (
                                                <div key={i}>{p.notes}</div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MamasPayment;