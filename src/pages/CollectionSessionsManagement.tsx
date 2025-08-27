import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { CollectionSessions } from "@/components/CollectionSessions";
import { Supplier as SupplierType } from "@/types/supplier";
import { useToast } from "@/hooks/use-toast";

interface BackendSupplier {
  id: number;
  company_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  phone: string;
  location: string;
  created_at: string;
  updated_at: string;
  region_name: string;
  region_code: string;
  sector_name: string;
  sector_code: string;
  janitors: Array<{
    id: number;
    name: string;
    phone: string;
    account: string;
    created_at: string;
    updated_at: string;
  }>;
}

interface BackendMarketer {
  full_name: string;
}

interface BackendCoordinator {
  id: number;
  full_name: string;
  role: string;
  phone: string;
  email: string;
}

const CollectionSessionsManagement = () => {
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [marketers, setMarketers] = useState<any[]>([]);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch suppliers
      const suppliersResponse = await fetch('http://localhost:5000/suppliers');
      const suppliersData = await suppliersResponse.json();
      
      if (suppliersData.status === 'success') {
        const formattedSuppliers: SupplierType[] = suppliersData.data.map((s: BackendSupplier) => ({
          id: s.id,
          name: s.company_name,
          contact: s.contact_phone || s.phone,
          phone: s.phone,
          email: s.contact_email || `contact@${s.company_name.toLowerCase().replace(/\s+/g, '')}.com`,
          location: s.location,
          region: s.region_name,
          sector: s.sector_name,
          contactPerson: {
            name: s.contact_person,
            position: "Manager",
            phone: s.phone,
            email: s.contact_email || `contact@${s.company_name.toLowerCase().replace(/\s+/g, '')}.com`
          },
          collections: {
            total: Math.floor(Math.random() * 100),
            thisMonth: Math.floor(Math.random() * 10),
            avgPerMonth: Math.floor(Math.random() * 8)
          },
          paymentInfo: {
            accountNumber: s.janitors[0]?.account || "123456789",
            bankName: "CBE",
            totalEarned: Math.floor(Math.random() * 100000)
          }
        }));
        setSuppliers(formattedSuppliers);
      }

      // Fetch marketers
      const marketersResponse = await fetch('http://localhost:5000/users/Marketor');
      const marketersData = await marketersResponse.json();
      
      if (marketersData.status === 'success') {
        const formattedMarketers = marketersData.data.map((m: BackendMarketer, index: number) => ({
          id: index + 1,
          name: m.full_name
        }));
        setMarketers(formattedMarketers);
      }

      // Fetch coordinators (collection coordinators)
      const coordinatorsResponse = await fetch('http://localhost:5000/users/collection-coordinators');
      const coordinatorsData = await coordinatorsResponse.json();
      
      if (coordinatorsData.status === 'success') {
        const formattedCoordinators = coordinatorsData.data.map((c: BackendCoordinator) => ({
          id: c.id,
          name: c.full_name,
          role: c.role,
          phone: c.phone,
          email: c.email
        }));
        setCoordinators(formattedCoordinators);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data from backend",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold">Collection Sessions Management</h1>
              <p className="text-muted-foreground">
                Professional collection session tracking with problem reporting and performance metrics
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-green-800">Collection Sessions Management</h1>
            <p className="text-muted-foreground">
              Professional collection session tracking with problem reporting and performance metrics
            </p>
          </div>
        </div>
      </div>

      <CollectionSessions 
        suppliers={suppliers} 
        marketers={marketers} 
        coordinators={coordinators}
      />
    </div>
  );
};

export default CollectionSessionsManagement;