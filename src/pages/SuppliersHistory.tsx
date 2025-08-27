import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  User, 
  Phone, 
  Edit2, 
  RefreshCw,
  Building2,
  Mail,
  Truck,
  Save,
  X,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface HistoryItem {
  id: number;
  history_details: string;
  created_at: string;
}

interface Supplier {
  id: number;
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  phone: string;
  location: string;
  region_name: string;
  region_code: string;
  sector_name: string;
  sector_code: string;
  created_at: string;
  updated_at: string;
  history: HistoryItem[];
}

export const SuppliersHistory = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingHistoryId, setEditingHistoryId] = useState<number | null>(null);
  const [editingHistoryText, setEditingHistoryText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch suppliers from backend
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/api/SuppliersWithHistory");
      if (response.data.status === "success") {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch suppliers");
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update supplier history
  const updateSupplierHistory = async (supplierId: number, historyNote: string) => {
    try {
      const response = await axios.post(`http://localhost:5000/supplier-history/${supplierId}`, {
        history_details: historyNote
      });
      if (response.data.status === "success") {
        toast.success("History updated successfully");
        fetchSuppliers(); // Refresh the list
        return true;
      }
    } catch (error) {
      toast.error("Failed to update history");
      console.error("Error updating history:", error);
    }
    return false;
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleEditHistory = (supplier: Supplier) => {
    setEditingHistoryId(supplier.id);
    // Get the latest history note if available
    const latestHistory = supplier.history.length > 0 
      ? supplier.history[supplier.history.length - 1].history_details 
      : "";
    setEditingHistoryText(latestHistory);
  };

  const handleSaveHistory = async (supplierId: number) => {
    const success = await updateSupplierHistory(supplierId, editingHistoryText);
    if (success) {
      setEditingHistoryId(null);
      setEditingHistoryText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingHistoryId(null);
    setEditingHistoryText("");
  };

  const getSectorIcon = (sector: string) => {
    const sectorIcons: Record<string, JSX.Element> = {
      "Car & Airline": <Truck className="h-4 w-4" />,
      "Addis Ababa": <Building2 className="h-4 w-4" />,
      "Group & Cement": <Building2 className="h-4 w-4" />,
    };
    return sectorIcons[sector] || <Building2 className="h-4 w-4" />;
  };

  const getLatestHistory = (history: HistoryItem[]) => {
    if (history.length === 0) return null;
    // Sort by date to get the latest history
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sortedHistory[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin mb-4" />
            <p>Loading suppliers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Suppliers History
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Complete history of all suppliers and their details
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSuppliers}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No suppliers found</h3>
            <p className="text-muted-foreground">No supplier history available at the moment.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Supplier Details</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>History</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => {
                  const latestHistory = getLatestHistory(supplier.history);
                  return (
                    <TableRow key={supplier.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="font-semibold">{supplier.company_name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-2">{supplier.location}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSectorIcon(supplier.sector_name)}
                          <Badge variant="outline">{supplier.sector_name}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{supplier.region_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3" />
                            {supplier.contact_person}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {supplier.contact_phone || supplier.phone}
                          </div>
                          {supplier.contact_email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {supplier.contact_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingHistoryId === supplier.id ? (
                          <div className="flex flex-col gap-2">
                            <Textarea
                              value={editingHistoryText}
                              onChange={(e) => setEditingHistoryText(e.target.value)}
                              placeholder="Add supplier history..."
                              className="min-h-[80px]"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveHistory(supplier.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="text-sm text-muted-foreground cursor-pointer min-h-[60px] p-2 border border-transparent hover:border-gray-200 rounded-md"
                            onClick={() => handleEditHistory(supplier)}
                          >
                            {latestHistory ? (
                              <div>
                                <div className="whitespace-pre-wrap">{latestHistory.history_details}</div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(latestHistory.created_at)}
                                </div>
                              </div>
                            ) : (
                              <div className="italic text-gray-400 flex items-center gap-1">
                                <Edit2 className="h-3 w-3" />
                                Click to add history
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};