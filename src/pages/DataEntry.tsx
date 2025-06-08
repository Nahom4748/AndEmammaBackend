
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DataEntry = () => {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    supplier: "",
    carType: "",
    bagCode: "",
    type: "",
    collectionType: "",
  });

  const handleSubmit = (e: React.FormEvent, entryType: string) => {
    e.preventDefault();
    toast({
      title: "Entry Added",
      description: `${entryType} collection entry has been saved successfully.`,
    });
    // Reset form
    setFormData({
      supplier: "",
      carType: "",
      bagCode: "",
      type: "",
      collectionType: "",
    });
  };

  const handleBulkImport = () => {
    toast({
      title: "Import Started",
      description: "Bulk data import is being processed.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold">Data Entry</h1>
          <p className="text-muted-foreground">Add new collection records</p>
        </div>
      </div>

      <Tabs defaultValue="regular" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="regular">Regular Collection</TabsTrigger>
          <TabsTrigger value="instore">In-store Collection</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="regular">
          <Card>
            <CardHeader>
              <CardTitle>Regular Collection Entry</CardTitle>
              <CardDescription>Add a new regular collection record</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmit(e, "Regular")} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Collection Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
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
                    <Label htmlFor="supplier">Supplier/Organization</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      placeholder="Enter supplier name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carType">Car Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, carType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select car type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sefu">Sefu</SelectItem>
                        <SelectItem value="abrar">Abrar</SelectItem>
                        <SelectItem value="adisu">Adisu</SelectItem>
                        <SelectItem value="aberar">Aberar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bagCode">Bag Code</Label>
                    <Input
                      id="bagCode"
                      value={formData.bagCode}
                      onChange={(e) => setFormData({...formData, bagCode: e.target.value})}
                      placeholder="Enter bag code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collectionType">Collection Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, collectionType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carton">Carton</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="sw">SW</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="np">NP</SelectItem>
                        <SelectItem value="mg">MG</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="box file">Box File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Regular Collection
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instore">
          <Card>
            <CardHeader>
              <CardTitle>In-store Collection Entry</CardTitle>
              <CardDescription>Add a new in-store collection record</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmit(e, "In-store")} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-instore">Collection Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
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
                    <Label htmlFor="supplier-instore">Supplier/Organization</Label>
                    <Input
                      id="supplier-instore"
                      placeholder="Enter supplier name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collectionType-instore">Collection Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carton">Carton</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="sw">SW</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="np">NP</SelectItem>
                        <SelectItem value="mg">MG</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="box file">Box File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or comments"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add In-store Collection
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Data Import</CardTitle>
              <CardDescription>Import multiple records from CSV file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Upload CSV File</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a CSV file with collection data to import
                </p>
                <div className="mt-6">
                  <Button onClick={handleBulkImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">CSV Format Requirements:</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Date, Day, Supplier, Car Type, Bag_code, Type, Collection_Type</li>
                  <li>• Date format: DD-MMM-YYYY (e.g., 2-May-2025)</li>
                  <li>• All fields are required except Bag_code</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataEntry;
