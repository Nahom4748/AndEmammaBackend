import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Target, Plus, Search, User, Phone, Building } from "lucide-react";
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
  const [showSupplierList, setShowSupplierList] = useState(false);

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

  // Function to handle phone call
  const handlePhoneCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  // Function to handle supplier selection from list
  const handleSupplierSelect = (supplierId: number) => {
    setSelectedSupplier(supplierId);
    setShowSupplierList(false);
    // Set search query to the selected supplier's name for better UX
    const selected = suppliers.find(s => s.id === supplierId);
    if (selected) {
      setSearchQuery(selected.company_name);
    }
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
      setSearchQuery("");
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access the collection planner</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
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
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold">Regular Collection Planning</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Schedule waste collection plans</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Location Filter and Search */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Filter Suppliers</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm sm:text-base">Filter by Location</Label>
                <Select 
                  value={locationFilter} 
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="w-full">
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
                <Label htmlFor="search" className="text-sm sm:text-base">Search Suppliers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search suppliers..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSupplierList(true);
                    }}
                    onFocus={() => setShowSupplierList(true)}
                    className="pl-10 w-full"
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
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supplier List */}
        {showSupplierList && filteredSuppliers.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Available Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSupplier === supplier.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleSupplierSelect(supplier.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{supplier.company_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {supplier.sector_name}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{supplier.contact_person}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{supplier.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{supplier.phone || supplier.contact_phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowSupplierList(false)}
                className="w-full mt-3"
                size="sm"
              >
                Hide Suppliers List
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plan Creation */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Create Collection Plan</CardTitle>
            </div>
            <CardDescription>Schedule waste collection from suppliers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Selected Supplier Display */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base">Selected Supplier</Label>
                {selectedSupplierData ? (
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm sm:text-base">{selectedSupplierData.company_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {selectedSupplierData.sector_name}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{selectedSupplierData.contact_person}</span>
                      </div>
                      <div 
                        className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => handlePhoneCall(selectedSupplierData.phone || selectedSupplierData.contact_phone)}
                      >
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="underline">
                          {selectedSupplierData.phone || selectedSupplierData.contact_phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{selectedSupplierData.location}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Region: {selectedSupplierData.region_name}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSupplier(null);
                        setSearchQuery("");
                      }}
                      className="w-full mt-3 text-xs"
                    >
                      Change Supplier
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 text-center">
                    <Building className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No supplier selected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Search and select a supplier from the list above
                    </p>
                  </div>
                )}
              </div>

              {/* Date and Driver Selection */}
              <div className="space-y-4 sm:space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm sm:text-base">Collection Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-10 w-full"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {selectedDate && (
                    <div className="text-sm mt-1">
                      {!isWeekday(selectedDate) ? (
                        <p className="text-red-500 text-xs sm:text-sm">
                          Collection can only be scheduled on weekdays
                        </p>
                      ) : (
                        <p className="text-green-600 text-xs sm:text-sm">
                          Selected: {new Date(selectedDate).toLocaleDateString()} ({getDayName(selectedDate)})
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Driver Selection */}
                <div className="space-y-2">
                  <Label htmlFor="driver" className="text-sm sm:text-base">Assign Driver *</Label>
                  <Select 
                    value={selectedDriver?.toString() || ""} 
                    onValueChange={(value) => setSelectedDriver(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select driver...">
                        {selectedDriver ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="truncate">
                              {drivers.find(d => d.user_id === selectedDriver)?.first_name} 
                              {" "}
                              {drivers.find(d => d.user_id === selectedDriver)?.last_name}
                            </span>
                          </div>
                        ) : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.length > 0 ? (
                        drivers.map((driver) => (
                          <SelectItem key={driver.user_id} value={driver.user_id.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {driver.first_name} {driver.last_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {driver.phone_number}
                                </span>
                              </div>
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
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm sm:text-base">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any specific notes about this collection..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 flex-col sm:flex-row">
              <Button
                onClick={handleSavePlan}
                disabled={!selectedSupplier || !selectedDate || !selectedDriver || !isWeekday(selectedDate) || isSaving}
                className="flex-1"
                size="lg"
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
                  setSearchQuery("");
                }}
                size="lg"
                className="sm:w-auto"
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