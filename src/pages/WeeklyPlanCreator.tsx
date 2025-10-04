import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { CalendarIcon, ListChecks, Search, Car, User, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/components/contexts/AuthContext";

interface Supplier {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  location: string;
  region_name: string;
  sector_name: string;
}

interface CollectionType {
  id: number;
  name: string;
}

interface Driver {
  id: number;
  name: string;
}

interface Coordinator {
  id: number;
  name: string;
}

interface Marketor {
  full_name: string;
}

interface WeeklyPlan {
  id: number;
  date: string;
  day: string;
  supplier: string;
  collectionType: string;
  driver?: string;
  coordinator?: string;
  marketer?: string;
  note?: string;
  created_by?: number;
}

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
type PlanType = "Regular" | "Instore";

const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeeklyPlan() {
  const { toast } = useToast();
  const { user } = useAuth();
  console.log("user data in weekly plan:", user);
  const [query, setQuery] = useState("");
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [type, setType] = useState<PlanType>(user?.role === "operation manager" ? "Instore" : "Regular");
  const [notes, setNotes] = useState("");
  const [driverId, setDriverId] = useState<number | null>(null);
  const [coordinatorId, setCoordinatorId] = useState<number | null>(null);
  const [marketorName, setMarketorName] = useState<string>("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [collectionTypes, setCollectionTypes] = useState<CollectionType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [marketors, setMarketors] = useState<Marketor[]>([]);
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState({
    suppliers: false,
    collectionTypes: false,
    drivers: false,
    coordinators: false,
    marketors: false,
    saving: false,
    plans: false
  });

  // Determine if user is operation manager
  const isOperationManager = user?.role === "operation_manager";

  // SEO
  useEffect(() => {
    document.title = "Weekly Collection Plan | Collection Manager";
    const desc = "Plan one-week collection for the team: select supplier, type, date, and save.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  // Fetch all necessary data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ 
          ...prev, 
          suppliers: true, 
          collectionTypes: true,
          drivers: true,
          coordinators: true,
          marketors: true,
          plans: true
        }));
        
        // Fetch suppliers
        const suppliersRes = await axios.get("http://localhost:5000/suppliers");
        setSuppliers(suppliersRes.data.data);
        
        // Fetch collection types
        const typesRes = await axios.get("http://localhost:5000/collectionstype");
        setCollectionTypes(typesRes.data.data);
        
        // Fetch drivers
        const driversRes = await axios.get("http://localhost:5000/drivers");
        setDrivers(driversRes.data.data);
        
        // Fetch coordinators
        const coordinatorsRes = await axios.get("http://localhost:5000/coordinators");
        setCoordinators(coordinatorsRes.data.data);
        
        // Fetch marketors
        const marketorsRes = await axios.get("http://localhost:5000/users/Marketor");
        setMarketors(marketorsRes.data.data);
        
        // Fetch plans based on user role
        let plansEndpoint = "http://localhost:5000/api/weekly-plan";
        if (isOperationManager) {
          plansEndpoint += `?user_id=${user.id}`;
        }
        
        const plansRes = await axios.get(plansEndpoint);
        setPlans(plansRes.data.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: error instanceof Error ? error.message : "An unknown error occurred",
        });
      } finally {
        setLoading(prev => ({ 
          ...prev, 
          suppliers: false, 
          collectionTypes: false,
          drivers: false,
          coordinators: false,
          marketors: false,
          plans: false
        }));
      }
    };

    fetchData();
  }, [toast, isOperationManager, user]);

  const filteredSuppliers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) =>
      [s.company_name, s.contact_person, s.location, s.region_name, s.sector_name]
        .some(v => v?.toLowerCase().includes(q))
    );
  }, [query, suppliers]);

  const groupedByDay = useMemo(() => {
    const map: Record<string, WeeklyPlan[]> = {
      Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: []
    };
    
    // Filter plans based on user role
    const filteredPlans = isOperationManager 
      ? plans.filter(plan => plan.collectionType === "Instore")
      : plans;
    
    filteredPlans.forEach((p) => { 
      if (map[p.day]) {
        map[p.day].push(p);
      }
    });
    return map;
  }, [plans, isOperationManager]);

  const handleSave = async () => {
    if (!supplierId || !date) {
      toast({ title: "Missing fields", description: "Select supplier and date." });
      return;
    }

    // Validate additional fields based on collection type
    if (type === "Regular" && !driverId) {
      toast({ title: "Missing driver", description: "Please select a driver for regular collection." });
      return;
    }

    if (type === "Instore" && (!coordinatorId || !marketorName)) {
      toast({ title: "Missing assignments", description: "Please select a coordinator and marketor for instore collection." });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, saving: true }));
      const supplier = suppliers.find((s) => s.id === supplierId)!;
      
      const planData = {
        supplier_id: supplier.id,
        day: format(date, "EEE"),
        type: type,
        date: format(date, "yyyy-MM-dd"),
        notes: notes,
        driver_id: type === "Regular" ? driverId : null,
        coordinator_id: type === "Instore" ? coordinatorId : null,
        marketor_name: type === "Instore" ? marketorName : null,
        created_by: user?.id || 1
      };

      await axios.post("http://localhost:5000/api/weekly-plan", { plans: [planData] });
      
      // Refresh plans based on user role
      let plansEndpoint = "http://localhost:5000/api/weekly-plan";
      if (isOperationManager) {
        plansEndpoint += `?user_id=${user.id}`;
      }
      
      const res = await axios.get(plansEndpoint);
      setPlans(res.data.data);

      toast({
        title: "Plan saved successfully!",
        description: `${supplier.company_name} on ${format(date, "EEE, MMM d")} (${type}).`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      // Reset form
      setNotes("");
      setDate(undefined);
      setSupplierId(null);
      setDriverId(null);
      setCoordinatorId(null);
      setMarketorName("");
      
      // Reset type based on user role
      if (isOperationManager) {
        setType("Instore");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save plan",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex items-center gap-3">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Weekly Collection Plan</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {isOperationManager ? "Manage Instore collections" : "Plan collections for the week"}
          </p>
          {isOperationManager && (
            <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
              Operation Manager View
            </Badge>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create Plan Section */}
        <section className="lg:col-span-1 space-y-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <ListChecks className="h-5 w-5" /> Create Collection Plan
              </CardTitle>
              <CardDescription>
                {isOperationManager 
                  ? "Create Instore collection plans" 
                  : "Select supplier, type and date, then save"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-green-800 mb-1 block">Search suppliers</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search by name, contact or location" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    className="border-gray-200 focus:ring-green-300 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-green-800 mb-1 block">Supplier</label>
                <Select 
                  value={supplierId ? String(supplierId) : undefined} 
                  onValueChange={(v) => setSupplierId(Number(v))}
                  disabled={loading.suppliers || filteredSuppliers.length === 0}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-green-300">
                    <SelectValue placeholder={filteredSuppliers.length === 0 ? "No suppliers found" : "Choose supplier"} />
                  </SelectTrigger>
                  <SelectContent className="z-50 border-gray-200 max-h-60">
                    {loading.suppliers ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                      </div>
                    ) : filteredSuppliers.length === 0 ? (
                      <div className="py-4 text-center text-sm text-gray-500">
                        No suppliers found
                      </div>
                    ) : (
                      filteredSuppliers.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)} className="hover:bg-green-50">
                          <div className="flex flex-col">
                            <span className="font-medium">{s.company_name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize border-green-200 text-green-800">
                                {s.sector_name}
                              </Badge>
                              <span className="text-xs text-gray-500">{s.region_name}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-green-800 mb-1 block">Collection type</label>
                <Select 
                  value={type} 
                  onValueChange={(v) => setType(v as PlanType)}
                  disabled={loading.collectionTypes || isOperationManager}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-green-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 border-gray-200">
                    {loading.collectionTypes ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                      </div>
                    ) : (
                      collectionTypes
                        .filter(type => !isOperationManager || type.name === "Instore")
                        .map((t) => (
                          <SelectItem key={t.id} value={t.name} className="hover:bg-green-50">
                            {t.name}
                            {isOperationManager && t.name === "Instore" && (
                              <span className="ml-2 text-xs text-blue-600">(Required for your role)</span>
                            )}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Driver selection for regular collection */}
              {type === "Regular" && !isOperationManager && (
                <div>
                  <label className="text-sm font-medium text-green-800 mb-1 block">Select Driver</label>
                  <Select 
                    value={driverId ? String(driverId) : undefined} 
                    onValueChange={(v) => setDriverId(Number(v))}
                    disabled={loading.drivers}
                  >
                    <SelectTrigger className="border-gray-200 focus:ring-green-300">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-green-600" />
                        <SelectValue placeholder="Choose driver" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-50 border-gray-200">
                      {loading.drivers ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                        </div>
                      ) : (
                        drivers.map((driver) => (
                          <SelectItem key={driver.id} value={String(driver.id)} className="hover:bg-green-50">
                            {driver.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Coordinator and Marketor selection for instore collection */}
              {type === "Instore" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-green-800 mb-1 block">Select Coordinator</label>
                    <Select 
                      value={coordinatorId ? String(coordinatorId) : undefined} 
                      onValueChange={(v) => setCoordinatorId(Number(v))}
                      disabled={loading.coordinators}
                    >
                      <SelectTrigger className="border-gray-200 focus:ring-green-300">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-green-600" />
                          <SelectValue placeholder="Choose coordinator" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="z-50 border-gray-200">
                        {loading.coordinators ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                          </div>
                        ) : (
                          coordinators.map((coordinator) => (
                            <SelectItem key={coordinator.id} value={String(coordinator.id)} className="hover:bg-green-50">
                              {coordinator.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-green-800 mb-1 block">Select Marketor</label>
                    <Select 
                      value={marketorName} 
                      onValueChange={setMarketorName}
                      disabled={loading.marketors}
                    >
                      <SelectTrigger className="border-gray-200 focus:ring-green-300">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-green-600" />
                          <SelectValue placeholder="Choose marketor" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="z-50 border-gray-200">
                        {loading.marketors ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                          </div>
                        ) : (
                          marketors.map((marketor, index) => (
                            <SelectItem key={index} value={marketor.full_name} className="hover:bg-green-50">
                              {marketor.full_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-green-800">Collection date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "justify-start font-normal border-gray-200 hover:bg-green-50 focus:ring-green-300",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-gray-200" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-green-800 mb-1 block">Notes (optional)</label>
                <Input 
                  placeholder="Any extra notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-gray-200 focus:ring-green-300"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSave} 
                  disabled={loading.saving || !supplierId || !date}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 focus:ring-green-300"
                >
                  {loading.saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Save Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Week Overview Section */}
        <section className="lg:col-span-2 space-y-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle className="text-green-800">
                    {isOperationManager ? "My Instore Collections" : "Week Overview"}
                  </CardTitle>
                  <CardDescription>
                    {isOperationManager 
                      ? "Your scheduled Instore collections" 
                      : "All scheduled collections"
                    }
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-white border-green-200 text-green-800 w-fit">
                  {isOperationManager 
                    ? `${plans.filter(p => p.collectionType === "Instore").length} Instore collections`
                    : `${plans.length} planned collections`
                  }
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {loading.plans ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {DAYS.map((day) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold mb-3 text-green-800 flex items-center justify-between">
                        <span>{day}</span>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {groupedByDay[day]?.length || 0}
                        </Badge>
                      </h3>
                      <div className="space-y-2">
                        {!groupedByDay[day] || groupedByDay[day].length === 0 ? (
                          <div className="text-center py-4 text-sm text-gray-500 border border-dashed border-gray-300 rounded-md">
                            No {isOperationManager ? "Instore " : ""}collections scheduled
                          </div>
                        ) : (
                          groupedByDay[day].map((p) => {
                            const planDate = new Date(p.date);
                            return (
                              <div 
                                key={p.id} 
                                className="p-3 rounded-md border border-green-100 bg-green-50 hover:bg-green-100 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-green-800">{p.supplier}</div>
                                  <Badge 
                                    className="capitalize text-xs" 
                                    variant={p.collectionType === 'Regular' ? 'default' : 'secondary'}
                                  >
                                    {p.collectionType}
                                  </Badge>
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                  {format(planDate, "MMM d, yyyy")}
                                </div>
                                {p.driver && (
                                  <div className="text-xs mt-1 text-muted-foreground">
                                    Driver: {p.driver}
                                  </div>
                                )}
                                {p.coordinator && (
                                  <div className="text-xs mt-1 text-muted-foreground">
                                    Coordinator: {p.coordinator}
                                  </div>
                                )}
                                {p.marketer && (
                                  <div className="text-xs mt-1 text-muted-foreground">
                                    Marketor: {p.marketer}
                                  </div>
                                )}
                                {p.note && (
                                  <div className="text-xs mt-1 text-muted-foreground">
                                    Note: {p.note}
                                  </div>
                                )}
                                {isOperationManager && p.created_by === user?.id && (
                                  <div className="text-xs mt-1 text-blue-600 font-medium">
                                    Created by you
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}