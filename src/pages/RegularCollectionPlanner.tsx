import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Target, Plus, Search, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useAuth } from "@/components/contexts/AuthContext";

interface Supplier {
  id: number;
  company_name: string;
  contact_person: string;
  contact_phone: string;
  phone: string;
  location: string;
  region_name: string;
  sector_name: string;
}

interface Driver {
  user_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  company_role_name: string;
}

export function RegularCollectionPlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Get user ID from authenticated user
  const userId = user?.user_id;

  useEffect(() => {
    if (userId) {
      fetchSuppliers();
      fetchDrivers();
    }
  }, [userId]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/suppliers");
      if (response.data.status === "success") {
        setSuppliers(response.data.data || []);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      });
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/users");
      if (response.data.status === "success") {
        // Filter users with driver role
        const driverUsers = response.data.data.filter(
          (user: Driver) => user.company_role_name.toLowerCase() === "driver"
        );
        setDrivers(driverUsers);
      } else {
        setDrivers([]);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch drivers",
        variant: "destructive",
      });
      setDrivers([]);
    }
  };

  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers;
    
    // Apply location filter
    if (locationFilter && locationFilter !== "all") {
      filtered = filtered.filter(s => s.location === locationFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.company_name.toLowerCase().includes(query) ||
        s.contact_person.toLowerCase().includes(query) ||
        s.location.toLowerCase().includes(query) ||
        s.sector_name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [suppliers, locationFilter, searchQuery]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    suppliers.forEach(supplier => {
      if (supplier.location) {
        locations.add(supplier.location);
      }
    });
    return Array.from(locations);
  }, [suppliers]);

  const selectedSupplierData = selectedSupplier 
    ? suppliers.find(s => s.id === selectedSupplier)
    : null;

  // Function to check if a date is a weekday
  const isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day !== 0 && day !== 6; // Sunday = 0, Saturday = 6
  };

  // Function to get day name from date
  const getDayName = (dateString: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const handleSavePlan = async () => {
    if (!selectedSupplier || !selectedDate || !selectedDriver) {
      toast({
        title: "Missing Information",
        description: "Please select a supplier, driver, and date",
        variant: "destructive",
      });
      return;
    }

    if (!isWeekday(selectedDate)) {
      toast({
        title: "Invalid Date",
        description: "Collection can only be scheduled on weekdays (Monday to Friday)",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Format the date to YYYY-MM-DD format for the backend
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      const dayName = getDayName(selectedDate);
      
      const planData = {
        supplier_id: selectedSupplier,
        driver_id: selectedDriver,
        created_by: userId,
        collection_date: formattedDate,
        collection_day: dayName,
        notes: notes || null,
        status: "Pending"
      };

      await axios.post("http://localhost:5000/api/collection-plans", planData);
      
      toast({
        title: "Plan Created",
        description: `Collection plan saved for ${selectedSupplierData?.company_name} on ${formattedDate} (${dayName})`,
      });

      // Reset form
      setSelectedSupplier(null);
      setSelectedDriver(null);
      setSelectedDate("");
      setNotes("");
    } catch (error: any) {
      console.error("Error saving plan:", error);
      let errorMessage = "Failed to save collection plan";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access the collection planner</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Regular Collection Planning</h1>
              <p className="text-sm text-muted-foreground">Schedule waste collection plans</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-6">
        {/* Location Filter and Search */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Filter Suppliers</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Filter by Location</Label>
                <Select 
                  value={locationFilter} 
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="search">Search Suppliers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, contact, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            {locationFilter && locationFilter !== "all" && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {locationFilter}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocationFilter("all")}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Creation */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <CardTitle>Create Collection Plan</CardTitle>
            </div>
            <CardDescription>Schedule waste collection from suppliers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Selection */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select 
                  value={selectedSupplier?.toString() || ""} 
                  onValueChange={(value) => setSelectedSupplier(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          <div className="space-y-1">
                            <div className="font-medium">{supplier.company_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {supplier.location}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-suppliers" disabled>
                        No suppliers found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date">Collection Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {selectedDate && (
                  <div className="text-sm mt-1">
                    {!isWeekday(selectedDate) ? (
                      <p className="text-red-500">Collection can only be scheduled on weekdays</p>
                    ) : (
                      <p className="text-green-600">
                        Selected: {new Date(selectedDate).toLocaleDateString()} ({getDayName(selectedDate)})
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Driver Selection */}
            <div className="space-y-2">
              <Label htmlFor="driver">Assign Driver *</Label>
              <Select 
                value={selectedDriver?.toString() || ""} 
                onValueChange={(value) => setSelectedDriver(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver..." />
                </SelectTrigger>
                <SelectContent>
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <SelectItem key={driver.user_id} value={driver.user_id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{driver.first_name} {driver.last_name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-drivers" disabled>
                      No drivers available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Supplier Details */}
            {selectedSupplierData && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <h4 className="font-medium mb-2">Supplier Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Contact Person</Label>
                    <p>{selectedSupplierData.contact_person}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p>{selectedSupplierData.phone}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Sector</Label>
                    <Badge variant="outline">{selectedSupplierData.sector_name}</Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Region</Label>
                    <p>{selectedSupplierData.region_name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <p className="text-xs">{selectedSupplierData.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any specific notes about this collection..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 flex-col sm:flex-row">
              <Button
                onClick={handleSavePlan}
                disabled={!selectedSupplier || !selectedDate || !selectedDriver || !isWeekday(selectedDate) || isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Save Collection Plan
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSupplier(null);
                  setSelectedDriver(null);
                  setSelectedDate("");
                  setNotes("");
                }}
              >
                Clear Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default RegularCollectionPlanner;