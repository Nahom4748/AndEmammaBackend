import { useState, useEffect } from "react";
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
import { CalendarIcon, Plus, Upload, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Supplier {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  location: string;
  janitors: Janitor[];
}

interface Janitor {
  id: number;
  name: string;
  phone: string;
  account: string;
}

interface CollectionType {
  id: number;
  name: string;
}

interface PaperType {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

interface Driver {
  id: number;
  name: string;
  phone: string;
}

interface Coordinator {
  id: number;
  name: string;
}

interface CollectionItem {
  key: string;
  paper_type_id?: number;
  bag_count?: number;
  kg?: number;
}

const DataEntry = () => {
  const [date, setDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [collectionTypes, setCollectionTypes] = useState<CollectionType[]>([]);
  const [paperTypes, setPaperTypes] = useState<PaperType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedJanitor, setSelectedJanitor] = useState<number | null>(null);
  const [selectedCollectionType, setSelectedCollectionType] = useState<number | null>(null);
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [formData, setFormData] = useState({
    driver_id: "",
    collection_coordinator_id: "",
    collection_mode: "regular", // 'regular' or 'instore'
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [suppliersRes, collectionTypesRes, paperTypesRes, driversRes, coordinatorsRes] = await Promise.all([
          axios.get('http://localhost:5000/suppliers'),
          axios.get('http://localhost:5000/collectionstype'),
          axios.get('http://localhost:5000/papertypes'),
          axios.get('http://localhost:5000/drivers'),
          axios.get('http://localhost:5000/coordinators')
        ]);

        setSuppliers(suppliersRes.data?.data || []);
        setCollectionTypes(collectionTypesRes.data?.data || []);
        setPaperTypes(paperTypesRes.data?.data || []);
        setDrivers(driversRes.data?.data || []);
        setCoordinators(coordinatorsRes.data?.data || []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === Number(supplierId)) || null;
    setSelectedSupplier(supplier);
    setSelectedJanitor(null);
  };

  const handleCollectionTypeChange = (typeId: string) => {
    setSelectedCollectionType(Number(typeId));
  };

  const addCollectionItem = () => {
    setCollectionItems(prev => [...prev, { key: Date.now().toString() }]);
  };

  const removeCollectionItem = (key: string) => {
    setCollectionItems(prev => prev.filter(item => item.key !== key));
  };

  const updateCollectionItem = (key: string, field: string, value: any) => {
    setCollectionItems(prev =>
      prev.map(item => item.key === key ? { ...item, [field]: value } : item)
    );
  };

  const totalKg = collectionItems.reduce((acc, item) => acc + (item.kg || 0), 0);
  const totalBags = collectionItems.reduce((acc, item) => acc + (item.bag_count || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!selectedSupplier || !selectedCollectionType || !date) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }

      if (collectionItems.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one collection item",
          variant: "destructive",
        });
        return;
      }

      if (formData.collection_mode === "instore" && !formData.collection_coordinator_id) {
        toast({
          title: "Error",
          description: "Please select a collection coordinator for in-store collections",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      const collectionData = {
        organization_id: selectedSupplier.id,
        collection_type_id: selectedCollectionType,
        driver_id: formData.driver_id,
        collection_date: format(date, 'yyyy-MM-dd'),
        collection_coordinator_id: formData.collection_coordinator_id || null,
        total_kg: totalKg,
        total_bag: totalBags,
        janitor_id: selectedJanitor,
        collection_mode: formData.collection_mode,
        items: collectionItems.map(item => ({
          paper_type_id: item.paper_type_id,
          bag_count: item.bag_count,
          kg: item.kg,
        })),
      };

      await axios.post('http://localhost:5000/collections', collectionData);
      toast({
        title: "Success",
        description: `${formData.collection_mode === 'regular' ? 'Regular' : 'In-store'} collection has been saved successfully`,
      });

      // Reset form
      setSelectedSupplier(null);
      setSelectedJanitor(null);
      setSelectedCollectionType(null);
      setCollectionItems([]);
      setFormData({
        driver_id: "",
        collection_coordinator_id: "",
        collection_mode: "regular",
      });
      setDate(new Date());
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save collection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

      <Tabs defaultValue="entry" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entry">Collection Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <CardTitle>Collection Entry</CardTitle>
              <CardDescription>Add a new collection record</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="collection-mode">Collection Mode *</Label>
                  <Select 
                    onValueChange={(value) => setFormData({...formData, collection_mode: value})}
                    value={formData.collection_mode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular Collection</SelectItem>
                      <SelectItem value="instore">In-store Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Collection Date *</Label>
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
                  <Label htmlFor="supplier">Supplier/Organization *</Label>
                  <Select onValueChange={handleSupplierChange} value={selectedSupplier?.id.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.company_name} - {supplier.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSupplier && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="janitor">Janitor *</Label>
                      <Select 
                        onValueChange={(value) => setSelectedJanitor(Number(value))} 
                        value={selectedJanitor?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select janitor" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedSupplier.janitors.map(janitor => (
                            <SelectItem key={janitor.id} value={janitor.id.toString()}>
                              {janitor.name} ({janitor.phone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Supplier Information</Label>
                      <div className="p-2 border rounded-md text-sm">
                        <p>Contact: {selectedSupplier.contact_person}</p>
                        <p>Phone: {selectedSupplier.phone}</p>
                        <p>Location: {selectedSupplier.location}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="collectionType">Collection Type *</Label>
                  <Select onValueChange={handleCollectionTypeChange} value={selectedCollectionType?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection type" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectionTypes.map(type => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver">Driver *</Label>
                  <Select 
                    onValueChange={(value) => setFormData({...formData, driver_id: value})}
                    value={formData.driver_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.name} ({driver.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.collection_mode === "instore" && (
                  <div className="space-y-2">
                    <Label htmlFor="coordinator">Collection Coordinator *</Label>
                    <Select 
                      onValueChange={(value) => setFormData({...formData, collection_coordinator_id: value})}
                      value={formData.collection_coordinator_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select coordinator" />
                      </SelectTrigger>
                      <SelectContent>
                        {coordinators.map(coordinator => (
                          <SelectItem key={coordinator.id} value={coordinator.id.toString()}>
                            {coordinator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Collection Items *</Label>
                <div className="border rounded-md p-4 space-y-4">
                  {collectionItems.map(item => (
                    <div key={item.key} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5">
                        <Select
                          onValueChange={(value) => updateCollectionItem(item.key, 'paper_type_id', Number(value))}
                          value={item.paper_type_id?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select paper type" />
                          </SelectTrigger>
                          <SelectContent>
                            {paperTypes.map(type => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name} {type.code && `(${type.code})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Bags"
                          value={item.bag_count || ''}
                          onChange={(e) => updateCollectionItem(item.key, 'bag_count', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="KG"
                          value={item.kg || ''}
                          onChange={(e) => updateCollectionItem(item.key, 'kg', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCollectionItem(item.key)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addCollectionItem}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Total Bags: {totalBags}</p>
                  <p className="text-sm font-medium">Total KG: {totalKg.toFixed(2)}</p>
                </div>
                <Button 
                  type="submit" 
                  onClick={handleSubmit}
                  disabled={loading || !selectedSupplier || !selectedCollectionType || !date || collectionItems.length === 0}
                >
                  {loading ? "Saving..." : "Save Collection"}
                </Button>
              </div>
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