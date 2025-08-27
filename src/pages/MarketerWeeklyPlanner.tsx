import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { CalendarPlus2, Trash2 } from "lucide-react";
import axios from "axios";

// Define types and utilities directly in the file
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

type VisitType = 'sourcing' | 'product' | 'strategic' | 'followup';
type VisitStatus = 'Pending' | 'Completed' | 'Cancelled';

interface VisitPlan {
  id: number;
  supplier_id: number;
  visit_date: string;
  notes: string | null;
  type: VisitType;
  status: VisitStatus;
  feedback: string;
  created_at: string;
  company_name?: string;
  contact_person?: string;
  supplier_location?: string;
}

interface Supplier {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  location: string;
  region_name: string;
  sector_name: string;
}

const visitTypes: { value: VisitType; label: string }[] = [
  { value: 'sourcing', label: 'Sourcing' },
  { value: 'product', label: 'Product' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'followup', label: 'Follow-up' },
];

// Date utility functions
function dateToDay(date: Date): typeof DAYS[number] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];
  if (DAYS.includes(dayName as any)) {
    return dayName as typeof DAYS[number];
  }
  throw new Error(`Date ${date} falls on Sunday which is not a working day`);
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function endOfWeekSaturday(date: Date): Date {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 5); // Monday + 5 days = Saturday
  return end;
}

export function MarketerWeeklyPlanner() {
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [dateISO, setDateISO] = useState<string>("");
  const [visitType, setVisitType] = useState<VisitType | "">("");
  const [note, setNote] = useState<string>("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<VisitPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentDate = new Date();
  const weekStart = startOfWeekMonday(currentDate);
  const weekEnd = endOfWeekSaturday(currentDate);
  const marketerId = 1; // Hardcoded marketer ID

  // Format dates for display
  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch suppliers
        const suppliersRes = await axios.get("http://localhost:5000/suppliers");
        setSuppliers(suppliersRes.data.data);
        
        // Fetch weekly plans
        await fetchWeeklyPlans();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchWeeklyPlans = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/marketer-visits", {
        params: {
          marketer_id: marketerId,
          start_date: weekStart.toISOString().split('T')[0],
          end_date: weekEnd.toISOString().split('T')[0]
        }
      });
      setWeeklyPlans(res.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weekly plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const groupedByDay: Record<string, VisitPlan[]> = useMemo(() => {
    const map: Record<string, VisitPlan[]> = {} as any;
    DAYS.forEach(d => (map[d] = []));
    
    weeklyPlans.forEach(p => { 
      const day = dateToDay(new Date(p.visit_date));
      map[day].push(p); 
    });
    
    return map;
  }, [weeklyPlans]);

  const resetForm = () => {
    setSupplierId(null);
    setDateISO("");
    setVisitType("");
    setNote("");
  };

  const onSave = async () => {
    if (!supplierId || !dateISO || !visitType) {
      toast({ 
        title: "Missing info", 
        description: "Select supplier, date and visit type.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const visitDate = new Date(dateISO);
      
      const plans = {
        supplier_id: supplierId,
        marketer_id: marketerId, // Using hardcoded marketer ID
        visit_date: visitDate.toISOString(),
        type: visitType,
        notes: note || null,
        status: "Pending" as VisitStatus
      };

      await axios.post("http://localhost:5000/api/marketer-visits", plans);
      
      toast({ 
        title: "Plan saved", 
        description: `Visit scheduled for ${visitDate.toLocaleDateString()}` 
      });
      
      resetForm();
      await fetchWeeklyPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save visit plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDeletePlan = async (planId: number) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/marketer-visits/${planId}`);
      
      toast({
        title: "Plan deleted",
        description: "Visit plan has been removed",
      });
      
      await fetchWeeklyPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete visit plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canDeletePlan = (visitDate: string) => {
    const planDate = new Date(visitDate);
    return planDate >= new Date(currentDate.toDateString());
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus2 className="h-5 w-5" /> Weekly Visit Plan
          </CardTitle>
          <CardDescription>
            Create visits for the week of {formatDateRange(weekStart, weekEnd)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-sm mb-1">Supplier</label>
              <Select 
                value={supplierId?.toString()} 
                onValueChange={(v) => setSupplierId(Number(v))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.company_name} ({s.location})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm mb-1">Date</label>
              <Input 
                type="date" 
                value={dateISO} 
                onChange={(e) => setDateISO(e.target.value)}
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]}
                max={weekEnd.toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Visit Type</label>
              <Select 
                value={visitType} 
                onValueChange={(v) => setVisitType(v as VisitType)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {visitTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Note (optional)</label>
            <Textarea 
              placeholder="Add context for the visit (optional)" 
              value={note} 
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={resetForm} disabled={isLoading}>
              Clear
            </Button>
            <Button onClick={onSave} disabled={isLoading || !supplierId}>
              Save plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            This Week's Plans
          </CardTitle>
          <CardDescription>
            Week of {formatDateRange(weekStart, weekEnd)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {DAYS.map((day) => (
                <div key={day} className="space-y-2">
                  <div className="text-sm font-medium">{day}</div>
                  <div className="space-y-2">
                    {groupedByDay[day].length === 0 ? (
                      <div className="text-xs text-muted-foreground border rounded-md p-2">
                        No visits scheduled
                      </div>
                    ) : (
                      groupedByDay[day].map((plan) => (
                        <div key={plan.id} className="border rounded-md p-2 relative group">
                          <div className="text-sm font-medium">
                            {plan.company_name || suppliers.find(s => s.id === plan.supplier_id)?.company_name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              {visitTypes.find(t => t.value === plan.type)?.label}
                            </Badge>
                            <Badge variant={plan.status === "Completed" ? "default" : "outline"}>
                              {plan.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(plan.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {plan.notes && (
                            <div className="text-xs mt-1 text-muted-foreground">
                              {plan.notes}
                            </div>
                          )}
                          {canDeletePlan(plan.visit_date) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => onDeletePlan(plan.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            All Plans
          </CardTitle>
          <CardDescription>
            Showing {weeklyPlans.length} visits in the current week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklyPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No visits scheduled for this week
                    </TableCell>
                  </TableRow>
                ) : (
                  weeklyPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        {plan.company_name || suppliers.find(s => s.id === plan.supplier_id)?.company_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {visitTypes.find(t => t.value === plan.type)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.status === "Completed" ? "default" : "outline"}>
                          {plan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{dateToDay(new Date(plan.visit_date))}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(plan.visit_date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {canDeletePlan(plan.visit_date) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onDeletePlan(plan.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}