import { useEffect, useMemo, useState } from "react";
import { format, startOfWeek, endOfWeek, addDays, isSameWeek, parseISO, isBefore } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface MarketerPlan {
  id: number;
  supplier_id: number;
  visit_date: string;
  notes: string | null;
  type: string;
  status: string;
  feedback: string;
  company_name: string;
  contact_person: string;
  supplier_location: string;
  marketer_name: string;
}

interface CollectionPlan {
  id: number;
  date: string;
  day: string;
  supplier: string;
  collectionType: string;
  coordinator: string | null;
  marketer: string | null;
  driver: string | null;
  note: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
type Day = typeof DAYS[number];

export default function CombinedPlansViewer() {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  });
  const [marketerPlans, setMarketerPlans] = useState<MarketerPlan[]>([]);
  const [collectionPlans, setCollectionPlans] = useState<CollectionPlan[]>([]);
  const [loading, setLoading] = useState({
    marketer: false,
    collection: false
  });
  const [collectionFilters, setCollectionFilters] = useState({
    type: "all",
    day: "all"
  });
  const [marketerFilters, setMarketerFilters] = useState({
    marketerName: "all",
    status: "all"
  });
  const [hasDataInWeeks, setHasDataInWeeks] = useState({
    prev: false,
    next: false
  });

  // Check if weeks have data
  const checkWeeksData = async (date: Date) => {
    try {
      const prevWeek = addDays(date, -7);
      const nextWeek = addDays(date, 7);

      // Check previous week
      const prevWeekStart = format(startOfWeek(prevWeek), "yyyy-MM-dd");
      const prevWeekEnd = format(endOfWeek(prevWeek), "yyyy-MM-dd");
      
      // Check next week
      const nextWeekStart = format(startOfWeek(nextWeek), "yyyy-MM-dd");
      const nextWeekEnd = format(endOfWeek(nextWeek), "yyyy-MM-dd");

      const [marketerPrevRes, collectionPrevRes, marketerNextRes, collectionNextRes] = await Promise.all([
        axios.get("http://localhost:5000/api/marketer-visits", {
          params: { start_date: prevWeekStart, end_date: prevWeekEnd }
        }),
        axios.get("http://localhost:5000/api/weekly-plan", {
          params: { start_date: prevWeekStart, end_date: prevWeekEnd }
        }),
        axios.get("http://localhost:5000/api/marketer-visits", {
          params: { start_date: nextWeekStart, end_date: nextWeekEnd }
        }),
        axios.get("http://localhost:5000/api/weekly-plan", {
          params: { start_date: nextWeekStart, end_date: nextWeekEnd }
        })
      ]);

      setHasDataInWeeks({
        prev: (marketerPrevRes.data.data && marketerPrevRes.data.data.length > 0) || 
              (collectionPrevRes.data.data && collectionPrevRes.data.data.length > 0),
        next: (marketerNextRes.data.data && marketerNextRes.data.data.length > 0) || 
              (collectionNextRes.data.data && collectionNextRes.data.data.length > 0)
      });
    } catch (error) {
      console.error("Error checking weeks data:", error);
    }
  };

  // Fetch plans when week changes
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading({ marketer: true, collection: true });
        const startDate = format(currentWeek.from, "yyyy-MM-dd");
        const endDate = format(currentWeek.to, "yyyy-MM-dd");

        // Fetch marketer plans
        const marketerRes = await axios.get("http://localhost:5000/api/marketer-visits", {
          params: { start_date: startDate, end_date: endDate }
        });
        setMarketerPlans(marketerRes.data.data || []);

        // Fetch collection plans
        const collectionRes = await axios.get("http://localhost:5000/api/weekly-plan", {
          params: { start_date: startDate, end_date: endDate }
        });
        setCollectionPlans(collectionRes.data.data || []);

        // Check adjacent weeks for data
        await checkWeeksData(currentWeek.from);

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load plans",
          description: error instanceof Error ? error.message : "An unknown error occurred",
        });
      } finally {
        setLoading({ marketer: false, collection: false });
      }
    };

    fetchPlans();
  }, [currentWeek, toast]);

  const handleWeekChange = (direction: "prev" | "next") => {
    const offset = direction === "prev" ? -7 : 7;
    const newFrom = addDays(currentWeek.from, offset);
    setCurrentWeek({
      from: startOfWeek(newFrom),
      to: endOfWeek(newFrom)
    });
  };

  const isCurrentWeek = isSameWeek(new Date(), currentWeek.from);

  // Get unique marketer names for filter
  const marketerNames = useMemo(() => {
    const names = new Set<string>();
    marketerPlans.forEach(plan => names.add(plan.marketer_name));
    return Array.from(names).sort();
  }, [marketerPlans]);

  // Sort and filter marketer plans
  const filteredMarketerPlans = useMemo(() => {
    let filtered = [...marketerPlans].sort((a, b) => 
      new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
    );

    if (marketerFilters.marketerName !== "all") {
      filtered = filtered.filter(plan => 
        plan.marketer_name === marketerFilters.marketerName
      );
    }

    if (marketerFilters.status !== "all") {
      filtered = filtered.filter(plan => 
        plan.status.toLowerCase() === marketerFilters.status.toLowerCase()
      );
    }

    return filtered;
  }, [marketerPlans, marketerFilters]);

  // Sort and filter collection plans
  const filteredCollectionPlans = useMemo(() => {
    let filtered = [...collectionPlans].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (collectionFilters.type !== "all") {
      filtered = filtered.filter(plan => 
        plan.collectionType.toLowerCase() === collectionFilters.type.toLowerCase()
      );
    }

    if (collectionFilters.day !== "all") {
      filtered = filtered.filter(plan => 
        format(parseISO(plan.date), "EEEE").toLowerCase() === collectionFilters.day.toLowerCase()
      );
    }

    return filtered;
  }, [collectionPlans, collectionFilters]);

  // Format date with time if available
  const formatPlanDate = (dateString: string) => {
    const date = new Date(dateString);
    const timePart = format(date, "h:mm a");
    
    // Only show time if it's not midnight
    if (timePart !== "12:00 AM") {
      return `${format(date, "EEE, MMM d")} at ${timePart}`;
    }
    return format(date, "EEE, MMM d");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-green-800">Weekly Plans Dashboard</h1>
          <p className="text-muted-foreground">View all marketer and collection plans</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-100">
        <Button 
          variant="outline" 
          className="border-green-300 text-green-800 hover:bg-green-100" 
          onClick={() => handleWeekChange("prev")}
          disabled={!hasDataInWeeks.prev}
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          Previous Week
        </Button>
        <div className="text-lg font-medium text-green-900">
          {format(currentWeek.from, "MMM d, yyyy")} - {format(currentWeek.to, "MMM d, yyyy")}
          {isCurrentWeek && (
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
              Current Week
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          className="border-green-300 text-green-800 hover:bg-green-100" 
          onClick={() => handleWeekChange("next")}
          disabled={!hasDataInWeeks.next}
        >
          Next Week
          <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="marketer" className="border rounded-lg p-2 bg-white">
        <TabsList className="grid w-full grid-cols-2 bg-green-50">
          <TabsTrigger value="marketer" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Marketer Plans
          </TabsTrigger>
          <TabsTrigger value="collection" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Collection Plans
          </TabsTrigger>
        </TabsList>

        {/* Marketer Plans Tab */}
        <TabsContent value="marketer">
          <Card className="border-green-100">
            <CardHeader className="bg-green-50 rounded-t-lg border-b border-green-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-900">Marketer Visit Plans</CardTitle>
                  <CardDescription>
                    {filteredMarketerPlans.length > 0 ? (
                      `Showing ${filteredMarketerPlans.length} visits from ${format(currentWeek.from, "MMM d")} - ${format(currentWeek.to, "MMM d, yyyy")}`
                    ) : (
                      `No visits planned for ${format(currentWeek.from, "MMM d")} - ${format(currentWeek.to, "MMM d, yyyy")}`
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={marketerFilters.marketerName}
                    onValueChange={(value) => setMarketerFilters({...marketerFilters, marketerName: value})}
                  >
                    <SelectTrigger className="w-[180px] border-green-300">
                      <SelectValue placeholder="Filter by marketer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Marketers</SelectItem>
                      {marketerNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={marketerFilters.status}
                    onValueChange={(value) => setMarketerFilters({...marketerFilters, status: value})}
                  >
                    <SelectTrigger className="w-[140px] border-green-300">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading.marketer ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : (
                <div className="rounded-md border border-green-100">
                  <Table>
                    <TableHeader className="bg-green-50">
                      <TableRow>
                        <TableHead className="text-green-900">Date</TableHead>
                        <TableHead className="text-green-900">Supplier</TableHead>
                        <TableHead className="text-green-900">Contact</TableHead>
                        <TableHead className="text-green-900">Type</TableHead>
                        <TableHead className="text-green-900">Status</TableHead>
                        <TableHead className="text-green-900">Marketer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMarketerPlans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {marketerFilters.marketerName !== "all" || marketerFilters.status !== "all" 
                              ? "No matching plans found for the selected filters" 
                              : "No visits planned for this week"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMarketerPlans.map(plan => (
                          <TableRow key={plan.id} className="hover:bg-green-50">
                            <TableCell>
                              <div className="font-medium">{formatPlanDate(plan.visit_date)}</div>
                            </TableCell>
                            <TableCell className="font-medium">{plan.company_name}</TableCell>
                            <TableCell>{plan.contact_person}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-green-200 text-green-800">
                                {plan.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                plan.status === "Completed" ? "default" : 
                                plan.status === "Cancelled" ? "destructive" : 
                                "outline"
                              } className={
                                plan.status === "Pending" ? "border-green-200 text-green-800" : ""
                              }>
                                {plan.status || "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>{plan.marketer_name}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collection Plans Tab */}
        <TabsContent value="collection">
          <Card className="border-green-100">
            <CardHeader className="bg-green-50 rounded-t-lg border-b border-green-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-900">Collection Plans</CardTitle>
                  <CardDescription>
                    {filteredCollectionPlans.length > 0 ? (
                      `Showing ${filteredCollectionPlans.length} collections from ${format(currentWeek.from, "MMM d")} - ${format(currentWeek.to, "MMM d, yyyy")}`
                    ) : (
                      `No collections planned for ${format(currentWeek.from, "MMM d")} - ${format(currentWeek.to, "MMM d, yyyy")}`
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={collectionFilters.type}
                    onValueChange={(value) => setCollectionFilters({...collectionFilters, type: value})}
                  >
                    <SelectTrigger className="w-[120px] border-green-300">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="instore">In-store</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={collectionFilters.day}
                    onValueChange={(value) => setCollectionFilters({...collectionFilters, day: value})}
                  >
                    <SelectTrigger className="w-[120px] border-green-300">
                      <SelectValue placeholder="Filter by day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Days</SelectItem>
                      {DAYS.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading.collection ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : (
                <div className="rounded-md border border-green-100">
                  <Table>
                    <TableHeader className="bg-green-50">
                      <TableRow>
                        <TableHead className="text-green-900">Date</TableHead>
                        <TableHead className="text-green-900">Supplier</TableHead>
                        <TableHead className="text-green-900">Type</TableHead>
                        <TableHead className="text-green-900">Day</TableHead>
                        <TableHead className="text-green-900">Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCollectionPlans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {collectionFilters.type !== "all" || collectionFilters.day !== "all" 
                              ? "No matching plans found for the selected filters" 
                              : "No collections planned for this week"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCollectionPlans.map(plan => (
                          <TableRow key={plan.id} className="hover:bg-green-50">
                            <TableCell>
                              <div className="font-medium">{formatPlanDate(plan.date)}</div>
                            </TableCell>
                            <TableCell className="font-medium">{plan.supplier}</TableCell>
                            <TableCell>
                              <Badge variant={
                                plan.collectionType === "Regular" ? "default" : "secondary"
                              } className={
                                plan.collectionType === "Regular" ? "bg-green-500" : "bg-green-200 text-green-800"
                              }>
                                {plan.collectionType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-green-200 text-green-800">
                                {plan.day}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {plan.note || "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}