
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Supplier } from "@/data/suppliersData";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface ScheduleDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleDialog = ({ supplier, open, onOpenChange }: ScheduleDialogProps) => {
  const [date, setDate] = useState<Date>();
  const [carType, setCarType] = useState("");
  const [collectionType, setCollectionType] = useState("regular");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const { toast } = useToast();

  const collectionTypes = ["carton", "mixed", "sw", "sc", "np", "mg", "metal", "box file"];

  const handleSubmit = () => {
    if (!date || !carType || selectedTypes.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Schedule Created",
      description: `Collection scheduled for ${supplier?.name} on ${format(date, "PPP")}`,
    });

    onOpenChange(false);
    setDate(undefined);
    setCarType("");
    setCollectionType("regular");
    setSelectedTypes([]);
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };

  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Collection</DialogTitle>
          <DialogDescription>
            Schedule a collection for {supplier.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Collection Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Car Type</Label>
            <Select onValueChange={setCarType}>
              <SelectTrigger>
                <SelectValue placeholder="Select car type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sefu">Sefu Car</SelectItem>
                <SelectItem value="abrar">Abrar Car</SelectItem>
                <SelectItem value="adisu">Adisu Car</SelectItem>
                <SelectItem value="aberar">Aberar Car</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Collection Type</Label>
            <Select onValueChange={setCollectionType} defaultValue="regular">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Collection</SelectItem>
                <SelectItem value="instore">In-store Collection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Paper Types to Collect</Label>
            <div className="grid grid-cols-2 gap-2">
              {collectionTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={type} className="text-sm font-normal">
                    {type.toUpperCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Janitor Contact</h4>
            <p className="text-sm text-blue-700">{supplier.janitor.name}</p>
            <p className="text-sm text-blue-700">{supplier.janitor.phone}</p>
            <p className="text-sm text-blue-700">{supplier.janitor.shift} Shift</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Schedule Collection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
