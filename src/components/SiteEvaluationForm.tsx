import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteEvaluationReport } from "@/types/site-evaluation";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

// API base URL - adjust according to your backend
const API_BASE_URL = 'http://localhost:3001/api';
const COLLECTION_SESSIONS_URL = 'http://localhost:5000/collection-sessions';

interface CollectionSession {
  id: number;
  session_number: string;
  supplier_id: number;
  supplier_name: string;
  marketer_id: number;
  marketer_name: string;
  coordinator_id: number;
  coordinator_name: string;
  site_location: string;
  estimated_start_date: string;
  estimated_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  status: string;
  estimatedAmount: number;
  collection_data: {
    estimatedAmount?: number;
    paperTypes?: {
      carton: number;
      mixed: number;
      sw: number;
      sc: number;
      np: number;
    };
    actualAmount?: number;
  };
  problems: Array<{
    id: string;
    sessionId: number;
    reportedBy: string;
    reportedDate: string;
    description: string;
    priority: string;
    status: string;
    resolvedBy?: string;
    resolvedDate?: string;
    resolution?: string;
  }>;
  comments: any[];
  created_at: string;
  updated_at: string;
}

interface SiteEvaluationFormProps {
  onSuccess: () => void;
}

export const SiteEvaluationForm = ({ onSuccess }: SiteEvaluationFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionSessions, setCollectionSessions] = useState<CollectionSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CollectionSession | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  const [formData, setFormData] = useState<Omit<SiteEvaluationReport, 'id' | 'createdAt' | 'updatedAt'>>({
    // Information
    supplierName: "",
    collectionCoordinator: "",
    startingDate: "",
    endDate: "",
    collectionType: "sorted",
    
    // Performance and bag utilization
    collectedAmountKg: 0,
    collectedAmountBagNumber: 0,
    sw: 0,
    sc: 0,
    mixed: 0,
    carton: 0,
    card: 0,
    newspaper: 0,
    magazine: 0,
    plastic: 0,
    boxfile: 0,
    metal: 0,
    book: 0,
    averageKgPerBag: 0,
    rateOfBag: 0,
    costOfBagPerKg: 0,
    bagReceivedFromStock: 0,
    bagUsed: 0,
    bagReturn: 0,
    
    // Sorting Labour cost
    noOfSortingAndCollectionLabor: 0,
    sortingRate: 0,
    costOfSortingAndCollectionLabour: 0,
    costOfLabourPerKg: 0,
    
    // Loading and Unloading cost
    noOfLoadingUnloadingLabour: 0,
    loadingUnloadingRate: 0,
    costOfLoadingUnloading: 0,
    costOfLoadingLabourPerKg: 0,
    
    // Transportation cost
    transportedBy: "",
    noOfTrip: 0,
    costOfTransportation: 0,
    costOfTransportPerKg: 0,
    
    // Quality
    qualityCheckedBy: "",
    qualityApprovedBy: "",
    
    // Feedback and issues
    customerFeedback: "",
    keyOperationIssues: "",
  });

  useEffect(() => {
    const fetchCollectionSessions = async () => {
      try {
        const response = await axios.get(COLLECTION_SESSIONS_URL);
        if (response.data.status === "success") {
          setCollectionSessions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching collection sessions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch collection sessions.",
          variant: "destructive",
        });
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchCollectionSessions();
  }, [toast]);

  // Calculate total collected amount whenever paper types change
  useEffect(() => {
    const total = formData.sw + formData.sc + formData.mixed + formData.carton + 
                 formData.card + formData.newspaper + formData.magazine + 
                 formData.plastic + formData.boxfile + formData.metal + formData.book;
    
    setFormData(prev => ({
      ...prev,
      collectedAmountKg: total
    }));
  }, [formData.sw, formData.sc, formData.mixed, formData.carton, formData.card, 
      formData.newspaper, formData.magazine, formData.plastic, formData.boxfile, 
      formData.metal, formData.book]);

  // Calculate bag return whenever bag received or used changes
  useEffect(() => {
    const bagReturn = formData.bagReceivedFromStock - formData.bagUsed;
    setFormData(prev => ({
      ...prev,
      bagReturn: bagReturn > 0 ? bagReturn : 0
    }));
  }, [formData.bagReceivedFromStock, formData.bagUsed]);

  const handleSessionSelect = (sessionId: string) => {
    const session = collectionSessions.find(s => s.id.toString() === sessionId);
    if (session) {
      setSelectedSession(session);
      setFormData(prev => ({
        ...prev,
        supplierName: session.supplier_name,
        collectionCoordinator: session.coordinator_name,
        startingDate: session.actual_start_date ? session.actual_start_date.split('T')[0] : "",
        endDate: session.actual_end_date ? session.actual_end_date.split('T')[0] : "",
        // Don't auto-populate paper types as they will be entered by user
      }));
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate derived values
      if (field === 'collectedAmountBagNumber') {
        const kg = updated.collectedAmountKg;
        const bags = Number(value);
        
        if (bags > 0) {
          updated.averageKgPerBag = Number((kg / bags).toFixed(2));
        }
      }
      
      // Auto-calculate cost of bag per kg
      if (field === 'rateOfBag' || field === 'collectedAmountBagNumber') {
        const rate = field === 'rateOfBag' ? Number(value) : updated.rateOfBag;
        const bags = field === 'collectedAmountBagNumber' ? Number(value) : updated.collectedAmountBagNumber;
        const kg = updated.collectedAmountKg;
        
        if (kg > 0) {
          updated.costOfBagPerKg = Number(((rate * bags) / kg).toFixed(3));
        }
      }
      
      // Auto-calculate labour costs
      if (field === 'noOfSortingAndCollectionLabor' || field === 'sortingRate' || field === 'collectedAmountKg') {
        const laborCount = field === 'noOfSortingAndCollectionLabor' ? Number(value) : updated.noOfSortingAndCollectionLabor;
        const rate = field === 'sortingRate' ? Number(value) : updated.sortingRate;
        const kg = field === 'collectedAmountKg' ? Number(value) : updated.collectedAmountKg;
        
        updated.costOfSortingAndCollectionLabour = Number((laborCount * rate * kg).toFixed(2));
        
        if (kg > 0) {
          updated.costOfLabourPerKg = Number((updated.costOfSortingAndCollectionLabour / kg).toFixed(3));
        }
      }
      
      // Auto-calculate loading costs
      if (field === 'noOfLoadingUnloadingLabour' || field === 'loadingUnloadingRate' || field === 'collectedAmountKg') {
        const laborCount = field === 'noOfLoadingUnloadingLabour' ? Number(value) : updated.noOfLoadingUnloadingLabour;
        const rate = field === 'loadingUnloadingRate' ? Number(value) : updated.loadingUnloadingRate;
        const kg = field === 'collectedAmountKg' ? Number(value) : updated.collectedAmountKg;
        
        updated.costOfLoadingUnloading = Number((laborCount * rate).toFixed(2));
        
        if (kg > 0) {
          updated.costOfLoadingLabourPerKg = Number((updated.costOfLoadingUnloading / kg).toFixed(3));
        }
      }
      
      // Auto-calculate transport cost per kg
      if (field === 'costOfTransportation' || field === 'collectedAmountKg') {
        const transportCost = field === 'costOfTransportation' ? Number(value) : updated.costOfTransportation;
        const kg = field === 'collectedAmountKg' ? Number(value) : updated.collectedAmountKg;
        
        if (kg > 0) {
          updated.costOfTransportPerKg = Number((transportCost / kg).toFixed(3));
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedSession) {
      toast({
        title: "Error",
        description: "Please select a collection session first.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.collectedAmountKg <= 0) {
      toast({
        title: "Error",
        description: "Collected amount must be greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
            // Send the form data to the backend API
      await axios.post(`http://localhost:5000/site-evaluation-reports`, {
        ...formData,
        sessionId: selectedSession.id
      });
      
      toast({
        title: "Success",
        description: "Site evaluation report created successfully!",
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Failed to create site evaluation report.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Collection Session Selection */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Select Collection Session</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <p>Loading collection sessions...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="collectionSession" className="text-green-700">Collection Session *</Label>
                <Select onValueChange={handleSessionSelect} required>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select a collection session" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectionSessions.map(session => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.session_number} - {session.supplier_name} ({session.site_location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSession && (
                <div className="p-4 bg-green-100 rounded-md">
                  <h3 className="font-semibold text-green-800">Session Details</h3>
                  <p className="text-green-700">Supplier: {selectedSession.supplier_name}</p>
                  <p className="text-green-700">Coordinator: {selectedSession.coordinator_name}</p>
                  <p className="text-green-700">Location: {selectedSession.site_location}</p>
                  <p className="text-green-700">Status: {selectedSession.status}</p>
                  {selectedSession.collection_data?.actualAmount && (
                    <p className="text-green-700">Collected Amount: {selectedSession.collection_data.actualAmount} kg</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. Information Section */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">1. Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplierName" className="text-green-700">Supplier Name</Label>
            <Input
              id="supplierName"
              value={formData.supplierName}
              readOnly
              className="bg-green-100"
            />
          </div>
          <div>
            <Label htmlFor="collectionCoordinator" className="text-green-700">Collection Coordinator</Label>
            <Input
              id="collectionCoordinator"
              value={formData.collectionCoordinator}
              readOnly
              className="bg-green-100"
            />
          </div>
          <div>
            <Label htmlFor="startingDate" className="text-green-700">Starting Date</Label>
            <Input
              id="startingDate"
              type="date"
              value={formData.startingDate}
              readOnly
              className="bg-green-100"
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-green-700">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              readOnly
              className="bg-green-100"
            />
          </div>
          <div>
            <Label htmlFor="collectionType" className="text-green-700">Collection Type</Label>
            <Select value={formData.collectionType} onValueChange={(value: 'sorted' | 'mixed') => handleInputChange('collectionType', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select collection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sorted">Sorted</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 2. Performance and bag utilization */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">2. Performance and Bag Utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="collectedAmountKg" className="text-green-700">Collected Amount (kg)</Label>
              <Input
                id="collectedAmountKg"
                type="number"
                step="0.1"
                value={formData.collectedAmountKg}
                readOnly
                className="bg-green-100"
              />
            </div>
            <div>
              <Label htmlFor="collectedAmountBagNumber" className="text-green-700">Collected Amount (bag number) *</Label>
              <Input
                id="collectedAmountBagNumber"
                type="number"
                value={formData.collectedAmountBagNumber}
                onChange={(e) => handleInputChange('collectedAmountBagNumber', Number(e.target.value))}
                required
                min="1"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="averageKgPerBag" className="text-green-700">Average kg/bag (Auto-calculated)</Label>
              <Input
                id="averageKgPerBag"
                type="number"
                step="0.1"
                value={formData.averageKgPerBag}
                readOnly
                className="bg-green-100"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-green-700">Paper Collection Types (kg) *</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sw" className="text-green-700">SW (White Paper) - kg</Label>
                <Input
                  id="sw"
                  type="number"
                  step="0.1"
                  value={formData.sw}
                  onChange={(e) => handleInputChange('sw', Number(e.target.value))}
                  placeholder="Enter SW amount in kg"
                  min="0"
                  className="bg-white"
                />
              </div>
              <div>
                <Label htmlFor="sc" className="text-green-700">SC (Colored Paper) - kg</Label>
                <Input
                  id="sc"
                  type="number"
                  step="0.1"
                  value={formData.sc}
                  onChange={(e) => handleInputChange('sc', Number(e.target.value))}
                  placeholder="Enter SC amount in kg"
                  min="0"
                  className="bg-white"
                />
              </div>
              <div>
                <Label htmlFor="mixed" className="text-green-700">Mixed Paper - kg</Label>
                <Input
                  id="mixed"
                  type="number"
                  step="0.1"
                  value={formData.mixed}
                  onChange={(e) => handleInputChange('mixed', Number(e.target.value))}
                  placeholder="Enter mixed paper amount in kg"
                  min="0"
                  className="bg-white"
                />
              </div>
              <div>
                <Label htmlFor="carton" className="text-green-700">Carton - kg</Label>
                <Input
                  id="carton"
                  type="number"
                  step="0.1"
                  value={formData.carton}
                  onChange={(e) => handleInputChange('carton', Number(e.target.value))}
                  placeholder="Enter carton amount in kg"
                  min="0"
                  className="bg-white"
                />
              </div>
              <div>
                <Label htmlFor="newspaper" className="text-green-700">Newspaper - kg</Label>
                <Input
                  id="newspaper"
                  type="number"
                  step="0.1"
                  value={formData.newspaper}
                  onChange={(e) => handleInputChange('newspaper', Number(e.target.value))}
                  placeholder="Enter newspaper amount in kg"
                  min="0"
                  className="bg-white"
                />
              </div>
              <div>
                <Label htmlFor="magazine" className="text-green-700">Magazine - kg</Label>
                <Input
                  id="magazine"
                  type="number"
                  step="0.1"
                  value={formData.magazine}
                  onChange={(e) => handleInputChange('magazine', Number(e.target.value))}
                  placeholder="Enter magazine amount in kg"
                  min="0"
                  className="bg-white"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rateOfBag" className="text-green-700">Rate of Bag *</Label>
              <Input
                id="rateOfBag"
                type="number"
                step="0.01"
                value={formData.rateOfBag}
                onChange={(e) => handleInputChange('rateOfBag', Number(e.target.value))}
                required
                min="0"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="costOfBagPerKg" className="text-green-700">Cost of Bag/kg (Auto-calculated)</Label>
              <Input
                id="costOfBagPerKg"
                type="number"
                step="0.01"
                value={formData.costOfBagPerKg}
                readOnly
                className="bg-green-100"
              />
            </div>
            <div>
              <Label htmlFor="bagReceivedFromStock" className="text-green-700">Bag Received from Stock *</Label>
              <Input
                id="bagReceivedFromStock"
                type="number"
                value={formData.bagReceivedFromStock}
                onChange={(e) => handleInputChange('bagReceivedFromStock', Number(e.target.value))}
                required
                min="0"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="bagUsed" className="text-green-700">Bag Used *</Label>
              <Input
                id="bagUsed"
                type="number"
                value={formData.bagUsed}
                onChange={(e) => handleInputChange('bagUsed', Number(e.target.value))}
                required
                min="0"
                max={formData.bagReceivedFromStock}
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="bagReturn" className="text-green-700">Bag Return (Auto-calculated)</Label>
              <Input
                id="bagReturn"
                type="number"
                value={formData.bagReturn}
                readOnly
                className="bg-green-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Sorting Labour cost */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">3. Sorting Labour Cost</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="noOfSortingAndCollectionLabor" className="text-green-700">No of Sorting and Collection Labor *</Label>
            <Input
              id="noOfSortingAndCollectionLabor"
              type="number"
              value={formData.noOfSortingAndCollectionLabor}
              onChange={(e) => handleInputChange('noOfSortingAndCollectionLabor', Number(e.target.value))}
              required
              min="0"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="sortingRate" className="text-green-700">Rate (birr/kg) *</Label>
            <Input
              id="sortingRate"
              type="number"
              step="0.01"
              value={formData.sortingRate}
              onChange={(e) => handleInputChange('sortingRate', Number(e.target.value))}
              required
              min="0"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="costOfSortingAndCollectionLabour" className="text-green-700">Cost of Sorting and Collection Labour (Auto-calculated)</Label>
            <Input
              id="costOfSortingAndCollectionLabour"
              type="number"
              step="0.01"
              value={formData.costOfSortingAndCollectionLabour}
              readOnly
              className="bg-green-100"
            />
          </div>
          <div>
            <Label htmlFor="costOfLabourPerKg" className="text-green-700">Cost of Labour/kg (Auto-calculated)</Label>
            <Input
              id="costOfLabourPerKg"
              type="number"
              step="0.01"
              value={formData.costOfLabourPerKg}
              readOnly
              className="bg-green-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Loading and Unloading cost */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">4. Loading and Unloading Cost</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="noOfLoadingUnloadingLabour" className="text-green-700">No of Loading/Unloading Labour *</Label>
            <Input
              id="noOfLoadingUnloadingLabour"
              type="number"
              value={formData.noOfLoadingUnloadingLabour}
              onChange={(e) => handleInputChange('noOfLoadingUnloadingLabour', Number(e.target.value))}
              required
              min="0"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="loadingUnloadingRate" className="text-green-700">Rate *</Label>
            <Input
              id="loadingUnloadingRate"
              type="number"
              step="0.01"
              value={formData.loadingUnloadingRate}
              onChange={(e) => handleInputChange('loadingUnloadingRate', Number(e.target.value))}
              required
              min="0"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="costOfLoadingUnloading" className="text-green-700">Cost of Loading/Unloading (Auto-calculated)</Label>
            <Input
              id="costOfLoadingUnloading"
              type="number"
              step="0.01"
              value={formData.costOfLoadingUnloading}
              readOnly
              className="bg-green-100"
            />
          </div>
          <div>
            <Label htmlFor="costOfLoadingLabourPerKg" className="text-green-700">Cost of Labour/kg (Auto-calculated)</Label>
            <Input
              id="costOfLoadingLabourPerKg"
              type="number"
              step="0.01"
              value={formData.costOfLoadingLabourPerKg}
              readOnly
              className="bg-green-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Transportation cost */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">5. Transportation Cost</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="transportedBy" className="text-green-700">Transported By *</Label>
            <Input
              id="transportedBy"
              value={formData.transportedBy}
              onChange={(e) => handleInputChange('transportedBy', e.target.value)}
              required
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="noOfTrip" className="text-green-700">No of Trip *</Label>
            <Input
              id="noOfTrip"
              type="number"
              value={formData.noOfTrip}
              onChange={(e) => handleInputChange('noOfTrip', Number(e.target.value))}
              required
              min="1"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="costOfTransportation" className="text-green-700">Cost of Transportation *</Label>
            <Input
              id="costOfTransportation"
              type="number"
              step="0.01"
              value={formData.costOfTransportation}
              onChange={(e) => handleInputChange('costOfTransportation', Number(e.target.value))}
              required
              min="0"
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="costOfTransportPerKg" className="text-green-700">Cost of Transport/kg (Auto-calculated)</Label>
            <Input
              id="costOfTransportPerKg"
              type="number"
              step="0.01"
              value={formData.costOfTransportPerKg}
              readOnly
              className="bg-green-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* 6. Quality */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">6. Our Customer Quality</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="qualityCheckedBy" className="text-green-700">Quality Checked By</Label>
            <Input
              id="qualityCheckedBy"
              value={formData.qualityCheckedBy}
              onChange={(e) => handleInputChange('qualityCheckedBy', e.target.value)}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="qualityApprovedBy" className="text-green-700">Quality Approved By</Label>
            <Input
              id="qualityApprovedBy"
              value={formData.qualityApprovedBy}
              onChange={(e) => handleInputChange('qualityApprovedBy', e.target.value)}
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* 7. Feedback and 8. Issues */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">7. Supplier Feedback & 8. Key Operation Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customerFeedback" className="text-green-700">Customer Feedback (Optional)</Label>
            <Textarea
              id="customerFeedback"
              value={formData.customerFeedback}
              onChange={(e) => handleInputChange('customerFeedback', e.target.value)}
              rows={3}
              className="bg-white"
            />
          </div>
          <div>
            <Label htmlFor="keyOperationIssues" className="text-green-700">Key Operation Issues (Optional)</Label>
            <Textarea
              id="keyOperationIssues"
              value={formData.keyOperationIssues}
              onChange={(e) => handleInputChange('keyOperationIssues', e.target.value)}
              rows={3}
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
        {isSubmitting ? "Creating Report..." : "Create Site Evaluation Report"}
      </Button>
    </form>
  );
};