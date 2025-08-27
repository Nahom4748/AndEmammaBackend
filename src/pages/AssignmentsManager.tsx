import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus, Loader2, X, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Checkbox } from "@/components/ui/checkbox";

interface Supplier {
  supplier_id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  location: string;
  region_id: number;
  sector_id: number;
  region_name: string;
  marketer_id: number | null;
  marketer_name: string | null;
  status?: string;
}

interface Marketer {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_role_name: string;
}

interface Sector {
  id: number;
  name: string;
  code: string;
}

export function AssignmentsManager() {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [marketerToAssign, setMarketerToAssign] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [regions, setRegions] = useState<{id: number, name: string}[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [suppliersRes, marketersRes, sectorsRes] = await Promise.all([
          axios.get('http://localhost:5000/suppliers/marketer-assignments'),
          axios.get('http://localhost:5000/users?role=marketer'),
          axios.get('http://localhost:5000/sectors')
        ]);

        if (suppliersRes.data?.status !== "success") throw new Error('Failed to fetch suppliers');
        if (marketersRes.data?.status !== "success") throw new Error('Failed to fetch marketers');
        if (sectorsRes.data?.status !== "success") throw new Error('Failed to fetch sectors');

        const supplierData = suppliersRes.data.data || [];
        const marketerData = marketersRes.data.data || [];
        const sectorData = sectorsRes.data.data || [];

        // Extract unique regions from suppliers
        const uniqueRegions = Array.from(new Map(
          supplierData.map(supplier => [supplier.region_id, {
            id: supplier.region_id,
            name: supplier.region_name
          }])
        ).values());

        // Filter only marketers
        const filteredMarketers = marketerData.filter(user => 
          user.company_role_name === "Marketer"
        );

        setSuppliers(supplierData);
        setMarketers(filteredMarketers);
        setSectors(sectorData);
        setRegions(uniqueRegions);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSector = sectorFilter === "all" || s.sector_id === Number(sectorFilter);
      const matchesRegion = regionFilter === "all" || s.region_id === Number(regionFilter);
      const q = search.toLowerCase();
      const matchesSearch = !q || 
        s.company_name.toLowerCase().includes(q) || 
        s.contact_person.toLowerCase().includes(q) ||
        (s.marketer_name && s.marketer_name.toLowerCase().includes(q));
      return matchesSector && matchesRegion && matchesSearch;
    });
  }, [suppliers, sectorFilter, regionFilter, search]);

  // Only show unassigned suppliers in bulk mode
  const unassignedSuppliers = useMemo(() => {
    return filteredSuppliers.filter(s => !s.marketer_id);
  }, [filteredSuppliers]);

  const selectedSupplier = selectedSupplierId != null ? 
    suppliers.find(s => s.supplier_id === selectedSupplierId) : undefined;

  const handleAssign = async () => {
    if (!selectedSupplierId || !marketerToAssign) return;
    
    try {
      setIsAssigning(true);
      const response = await axios.post('http://localhost:5000/suppliers/assign-marketer', {
        supplierId: selectedSupplierId,
        marketerId: marketerToAssign
      });

      if (response.data?.status !== "success") throw new Error('Failed to assign marketer');

      toast({
        title: "Assignment successful",
        description: `Marketer has been assigned to ${selectedSupplier?.company_name}`,
        action: <Check className="h-4 w-4 text-green-500" />,
      });

      // Refresh data
      const suppliersRes = await axios.get('http://localhost:5000/suppliers/marketer-assignments');
      if (suppliersRes.data?.status === "success") {
        setSuppliers(suppliersRes.data.data);
      }
      
      setMarketerToAssign(null);
      setSelectedSupplierId(null);
    } catch (err) {
      console.error('Error assigning marketer:', err);
      toast({
        title: "Assignment failed",
        description: err instanceof Error ? err.message : 'Could not assign marketer',
        variant: "destructive",
        action: <X className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedSuppliers.length === 0 || !marketerToAssign) return;
    
    try {
      setIsAssigning(true);
      const response = await axios.post('http://localhost:5000/suppliers/bulk-assign-marketer', {
        supplierIds: selectedSuppliers,
        marketerId: marketerToAssign
      });

      if (response.data?.status !== "success") throw new Error('Failed to assign marketers');

      toast({
        title: "Bulk assignment successful",
        description: `Marketer has been assigned to ${selectedSuppliers.length} suppliers`,
        action: <Check className="h-4 w-4 text-green-500" />,
      });

      // Refresh data
      const suppliersRes = await axios.get('http://localhost:5000/suppliers/marketer-assignments');
      if (suppliersRes.data?.status === "success") {
        setSuppliers(suppliersRes.data.data);
      }
      
      setMarketerToAssign(null);
      setSelectedSuppliers([]);
      setIsBulkMode(false);
    } catch (err) {
      console.error('Error assigning marketers:', err);
      toast({
        title: "Bulk assignment failed",
        description: err instanceof Error ? err.message : 'Could not assign marketers',
        variant: "destructive",
        action: <X className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async (supplierId: number) => {
    try {
      setIsAssigning(true);
      const response = await axios.delete(`http://localhost:5000/suppliers/remove-marketer/${supplierId}`);

      if (response.data?.status !== "success") throw new Error('Failed to unassign marketer');

      toast({
        title: "Unassignment successful",
        description: `Marketer has been unassigned`,
        action: <Check className="h-4 w-4 text-green-500" />,
      });

      // Refresh data
      const suppliersRes = await axios.get('http://localhost:5000/suppliers/marketer-assignments');
      if (suppliersRes.data?.status === "success") {
        setSuppliers(suppliersRes.data.data);
      }
    } catch (err) {
      console.error('Error unassigning marketer:', err);
      toast({
        title: "Unassignment failed",
        description: err instanceof Error ? err.message : 'Could not unassign marketer',
        variant: "destructive",
        action: <X className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleSupplierSelection = (supplierId: number) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId) 
        : [...prev, supplierId]
    );
  };

  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    setSelectedSuppliers([]);
    setSelectedSupplierId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header with Sidebar Trigger */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold text-green-800">Supplier Marketer Assignment</h1>
          <p className="text-muted-foreground">Manage marketer assignments to suppliers</p>
        </div>
      </div>

      <Card className="border-green-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <UserPlus className="h-5 w-5" /> 
                Assign Marketers to Suppliers
              </CardTitle>
              <CardDescription className="text-green-600">
                {isBulkMode 
                  ? "Select multiple unassigned suppliers to assign a marketer in bulk" 
                  : "Filter suppliers by sector and region, click a supplier to view or add assigned marketers."}
              </CardDescription>
            </div>
            <Button 
              variant={isBulkMode ? "default" : "outline"} 
              className={isBulkMode ? "bg-green-600 hover:bg-green-700" : "border-green-300 text-green-700"}
              onClick={toggleBulkMode}
            >
              {isBulkMode ? "Exit Bulk Mode" : "Bulk Assign"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter and Search Section */}
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="block text-sm mb-1 text-green-700">Sector</label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="border-green-200 focus:ring-green-500">
                  <SelectValue placeholder="All sectors" />
                </SelectTrigger>
                <SelectContent className="bg-white border-green-100">
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-green-700">Region</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="border-green-200 focus:ring-green-500">
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent className="bg-white border-green-100">
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(r => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-green-500" />
              <Input 
                className="pl-10 border-green-200 focus:ring-green-500" 
                placeholder="Search suppliers..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="rounded-md border border-green-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-green-50">
                <TableRow>
                  {isBulkMode && <TableHead className="text-green-700 w-10"></TableHead>}
                  <TableHead className="text-green-700">Company Name</TableHead>
                  <TableHead className="text-green-700">Contact Person</TableHead>
                  <TableHead className="text-green-700">Region</TableHead>
                  <TableHead className="text-green-700">Sector</TableHead>
                  <TableHead className="text-green-700">Assigned Marketer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isBulkMode ? unassignedSuppliers : filteredSuppliers).map(s => {
                  const isSelected = isBulkMode 
                    ? selectedSuppliers.includes(s.supplier_id)
                    : selectedSupplierId === s.supplier_id;
                  const sector = sectors.find(sec => sec.id === s.sector_id);
                  return (
                    <TableRow 
                      key={s.supplier_id} 
                      className={isSelected ? "bg-green-50" : "cursor-pointer hover:bg-green-50"} 
                      onClick={() => !isBulkMode && setSelectedSupplierId(s.supplier_id)}
                    >
                      {isBulkMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedSuppliers.includes(s.supplier_id)}
                            onCheckedChange={() => toggleSupplierSelection(s.supplier_id)}
                            className="border-green-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{s.company_name}</TableCell>
                      <TableCell>{s.contact_person}</TableCell>
                      <TableCell>{s.region_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          {sector?.name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {s.marketer_name ? (
                          <Badge className="bg-green-100 text-green-700">{s.marketer_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Bulk Assignment Section */}
          {isBulkMode && (
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="text-green-700">Bulk Assign Marketer</CardTitle>
                <CardDescription className="text-green-600">
                  {selectedSuppliers.length > 0 
                    ? `Selected ${selectedSuppliers.length} unassigned suppliers` 
                    : "Select suppliers from the table above"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm mb-1 text-green-700">Marketer</label>
                  <Select 
                    value={marketerToAssign?.toString()} 
                    onValueChange={(v) => setMarketerToAssign(Number(v))}
                    disabled={isAssigning}
                  >
                    <SelectTrigger className="border-green-200 focus:ring-green-500">
                      <SelectValue placeholder="Choose marketer" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-green-100">
                      {marketers.map(m => (
                        <SelectItem key={m.user_id} value={m.user_id.toString()}>
                          {m.first_name} {m.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleBulkAssign} 
                  disabled={selectedSuppliers.length === 0 || !marketerToAssign || isAssigning}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isAssigning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Assign to ${selectedSuppliers.length} supplier(s)`
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Single Supplier Details Section */}
          {!isBulkMode && selectedSupplier && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2 border-green-100">
                <CardHeader>
                  <CardTitle className="text-green-700">Supplier Details</CardTitle>
                  <CardDescription className="text-green-600">
                    Full information and assigned marketers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Company Name</div>
                      <div className="font-medium">{selectedSupplier.company_name}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Contact Person</div>
                      <div className="font-medium">{selectedSupplier.contact_person}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Phone</div>
                      <div className="font-medium">{selectedSupplier.phone}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Location</div>
                      <div className="font-medium">{selectedSupplier.location}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Region</div>
                      <div className="font-medium">{selectedSupplier.region_name}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Sector</div>
                      <div className="font-medium">
                        {sectors.find(s => s.id === selectedSupplier.sector_id)?.name || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-green-100">
                    <div className="text-sm font-medium mb-2 text-green-700">Assigned marketer</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.marketer_name ? (
                        <Badge variant="secondary" className="flex items-center gap-2 bg-green-100 text-green-700">
                          {selectedSupplier.marketer_name}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-red-500 hover:bg-red-50" 
                            onClick={() => handleUnassign(selectedSupplier.supplier_id)}
                            disabled={isAssigning}
                          >
                            Remove
                          </Button>
                        </Badge>
                      ) : (
                        <div className="text-sm text-muted-foreground">No marketer assigned yet.</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assign Marketer Section */}
              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="text-green-700">Assign marketer</CardTitle>
                  <CardDescription className="text-green-600">
                    Select a marketer to assign to this supplier
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1 text-green-700">Marketer</label>
                    <Select 
                      value={marketerToAssign?.toString()} 
                      onValueChange={(v) => setMarketerToAssign(Number(v))}
                      disabled={isAssigning}
                    >
                      <SelectTrigger className="border-green-200 focus:ring-green-500">
                        <SelectValue placeholder="Choose marketer" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-green-100">
                        {marketers.map(m => (
                          <SelectItem key={m.user_id} value={m.user_id.toString()}>
                            {m.first_name} {m.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleAssign} 
                    disabled={!marketerToAssign || isAssigning}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isAssigning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Assign to ${selectedSupplier.company_name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}