
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Building, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const suppliers = [
    {
      id: 1,
      name: "Addis Ababa University",
      type: "Educational",
      contact: "Dr. Alemayehu Tadese",
      phone: "+251-11-123-4567",
      email: "contact@aau.edu.et",
      address: "4 Kilo Campus, Addis Ababa",
      status: "active",
      lastCollection: "2025-05-30",
      totalCollections: 45,
    },
    {
      id: 2,
      name: "FDRE Ministry of Justice",
      type: "Government",
      contact: "Ato Bekele Mamo",
      phone: "+251-11-234-5678",
      email: "info@moj.gov.et",
      address: "Main Office, Addis Ababa",
      status: "active",
      lastCollection: "2025-05-28",
      totalCollections: 38,
    },
    {
      id: 3,
      name: "Ethiopian Chamber of Commerce",
      type: "Private",
      contact: "W/ro Hanan Ahmed",
      phone: "+251-11-345-6789",
      email: "contact@ethiopianchamber.com",
      address: "Mexico Square, Addis Ababa",
      status: "active",
      lastCollection: "2025-05-29",
      totalCollections: 32,
    },
    {
      id: 4,
      name: "AACA Farms Commission",
      type: "Government",
      contact: "Ato Samuel Kifle",
      phone: "+251-11-456-7890",
      email: "farms@addisababa.gov.et",
      address: "Head Office, Addis Ababa",
      status: "inactive",
      lastCollection: "2025-05-15",
      totalCollections: 28,
    },
    {
      id: 5,
      name: "Kotebe Educational University",
      type: "Educational",
      contact: "Dr. Meron Zeleke",
      phone: "+251-11-567-8901",
      email: "admin@keu.edu.et",
      address: "Kotebe Campus, Addis Ababa",
      status: "active",
      lastCollection: "2025-05-27",
      totalCollections: 25,
    },
  ];

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Educational":
        return "bg-blue-100 text-blue-800";
      case "Government":
        return "bg-purple-100 text-purple-800";
      case "Private":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Suppliers</h1>
            <p className="text-muted-foreground">Manage collection suppliers and organizations</p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(supplier.status)}>
                  {supplier.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Badge className={getTypeColor(supplier.type)} variant="outline">
                  {supplier.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {supplier.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {supplier.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {supplier.address}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Collections</span>
                  <span className="font-medium">{supplier.totalCollections}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Last Collection</span>
                  <span className="font-medium">{supplier.lastCollection}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No suppliers found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Suppliers;
