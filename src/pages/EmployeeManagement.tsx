import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Users, UserCheck, UserX, Download } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Employee {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_role_id: number;
  company_role_name: string;
  join_date?: string;
  status?: "active" | "inactive";
  salary?: number;
  address?: string;
  emergency_contact?: string;
  account_number?: string;
}

interface Role {
  company_role_id: number;
  company_role_name: string;
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "all",
    status: "all"
  });

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/users');
      setEmployees(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch employees");
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/roles');
      setRoles(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch roles");
      console.error("Error fetching roles:", error);
    }
  };

  const filterEmployees = () => {
    let result = [...employees];
    
    if (filters.role !== "all") {
      result = result.filter(emp => emp.company_role_name === filters.role);
    }
    
    if (filters.status !== "all") {
      result = result.filter(emp => emp.status === filters.status);
    }
    
    setFilteredEmployees(result);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      status: "active",
      join_date: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      ...employee,
      join_date: employee.join_date || new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (!formData.first_name || !formData.last_name || !formData.company_role_id || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingEmployee) {
        await axios.put(`http://localhost:5000/users/${editingEmployee.user_id}`, formData);
        toast.success("Employee updated successfully");
      } else {
        const newEmployee = {
          ...formData,
          account_number: formData.account_number || `EMP-${Date.now()}-2024`
        };
        await axios.post('http://localhost:5000/users', newEmployee);
        toast.success("Employee added successfully");
      }
      
      fetchEmployees();
      setIsDialogOpen(false);
      setFormData({});
    } catch (error) {
      toast.error("Failed to save employee");
      console.error("Error saving employee:", error);
    }
  };

  const downloadExcel = () => {
    // Create CSV content
    const headers = ["First Name", "Last Name", "Email", "Phone", "Role", "Join Date", "Status", "Salary", "Address", "Emergency Contact", "Account Number"];
    const csvContent = [
      headers.join(","),
      ...filteredEmployees.map(emp => [
        `"${emp.first_name}"`,
        `"${emp.last_name}"`,
        emp.email,
        emp.phone || "",
        `"${emp.company_role_name}"`,
        emp.join_date || "",
        emp.status || "",
        emp.salary || "",
        `"${emp.address || ""}"`,
        emp.emergency_contact || "",
        emp.account_number || ""
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `employees-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Excel file downloaded successfully");
  };

  const activeEmployees = employees.filter(emp => emp.status === "active").length;
  const inactiveEmployees = employees.filter(emp => emp.status === "inactive").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Employee Management</h1>
          <p className="text-green-600 mt-2">Manage your workforce and employee information</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={downloadExcel} 
            variant="outline" 
            className="border-green-600 text-green-700 hover:bg-green-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button 
            onClick={handleAddEmployee} 
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-full md:w-1/3">
          <Label htmlFor="role-filter" className="text-green-700">Filter by Role</Label>
          <Select
            value={filters.role}
            onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger className="border-green-300">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role.company_role_id} value={role.company_role_name}>
                  {role.company_role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <Label htmlFor="status-filter" className="text-green-700">Filter by Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="border-green-300">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{employees.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{activeEmployees}</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Inactive Employees</CardTitle>
            <UserX className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{inactiveEmployees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Employee List</CardTitle>
          <CardDescription className="text-green-600">
            Showing {filteredEmployees.length} of {employees.length} employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-green-800">Name</TableHead>
                  <TableHead className="text-green-800">Email</TableHead>
                  <TableHead className="text-green-800">Role</TableHead>
                  <TableHead className="text-green-800">Phone</TableHead>
                  <TableHead className="text-green-800">Join Date</TableHead>
                  <TableHead className="text-green-800">Status</TableHead>
                  <TableHead className="text-green-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.user_id}>
                    <TableCell>
                      <div className="font-medium text-green-900">
                        {employee.first_name} {employee.last_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-green-800">{employee.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {employee.company_role_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-green-800">{employee.phone || "-"}</TableCell>
                    <TableCell className="text-green-800">
                      {employee.join_date ? new Date(employee.join_date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={employee.status === "active" ? "default" : "destructive"}
                        className={employee.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {employee.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border-green-200">
          <DialogHeader>
            <DialogTitle className="text-green-800">
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription className="text-green-600">
              {editingEmployee ? "Update employee information" : "Add a new employee to your workforce"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-green-800">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="First name"
                className="border-green-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-green-800">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Last name"
                className="border-green-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-800">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="employee@company.com"
                className="border-green-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-green-800">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+251-911-000-000"
                className="border-green-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_role_id" className="text-green-800">Role *</Label>
              <Select
                value={formData.company_role_id?.toString() || ""}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  company_role_id: parseInt(value),
                  company_role_name: roles.find(r => r.company_role_id === parseInt(value))?.company_role_name || ""
                }))}
              >
                <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem 
                      key={role.company_role_id} 
                      value={role.company_role_id.toString()}
                      className="focus:bg-green-50"
                    >
                      {role.company_role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="join_date" className="text-green-800">Join Date</Label>
              <Input
                id="join_date"
                type="date"
                value={formData.join_date || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, join_date: e.target.value }))}
                className="border-green-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-green-800">Salary (ETB)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
                placeholder="5000"
                className="border-green-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="text-green-800">Status</Label>
              <Select
                value={formData.status || "active"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "active" | "inactive" }))}
              >
                <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="focus:bg-green-50">Active</SelectItem>
                  <SelectItem value="inactive" className="focus:bg-green-50">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address" className="text-green-800">Address</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Employee address"
                className="border-green-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergency_contact" className="text-green-800">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                placeholder="Emergency contact number"
                className="border-green-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account_number" className="text-green-800">Account Number</Label>
              <Input
                id="account_number"
                value={formData.account_number || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="Employee account number"
                className="border-green-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEmployee} 
              className="bg-green-600 hover:bg-green-700"
            >
              {editingEmployee ? "Update" : "Add"} Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}