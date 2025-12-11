import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";

const CollectionPlan: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filters, setFilters] = useState({
    person: "",
    businessUnit: "",
    role: "",
  });

  // Ensure numbers are stored as numbers (not strings)
  const collectionData = {
    collectionIncharge: "John Doe",
    customerName: "ABC Corporation",
    segment: "Enterprise",
    packageName: "Premium Package",
    totalOutstanding: 1250000,
    notDue: 500000,
    overdue: 250000,
    dueThisMonth: 500000,
    totalDueForPlan: 750000,
    planFinalised: 600000,
    received: 400000,
    statutoryDeductions: 50000,
  };

  // Derived values
  const balance = collectionData.planFinalised - collectionData.received - collectionData.statutoryDeductions;
  const targetAchieved =
    ((collectionData.received + collectionData.statutoryDeductions) / collectionData.planFinalised) * 100;

  const roleOptions = [
    "Sales Manager",
    "Sales Head",
    "Project Manager",
    "Project Head",
    "Collection Head",
    "Business Head",
    "Collection Agent",
    "Collection Incharge",
  ];

  const businessUnitOptions = ["All Business Units", "Unit 1", "Unit 2", "Unit 3"];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Monthly Collection Plan</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[ 
          { label: "Total Outstanding", value: collectionData.totalOutstanding },
          { label: "Plan Finalised", value: collectionData.planFinalised },
          { label: "Received", value: collectionData.received },
          { label: "Balance", value: balance },
        ].map((item, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{item.value.toLocaleString("en-IN")}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View in System */}
      <Card className="mb-6">
        <CardHeader
          className="flex flex-row items-center justify-between p-4 border-b cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-lg">View in System (Horizontal)</CardTitle>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm">Person Wise Filter</label>
                <Input
                  placeholder="Search person..."
                  value={filters.person}
                  onChange={(e) => handleFilterChange("person", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm">Business Unit</label>
                <Select
                  value={filters.businessUnit}
                  onValueChange={(value) => handleFilterChange("businessUnit", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Business Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessUnitOptions.map((unit, index) => (
                      <SelectItem key={index} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm">Role</label>
                <Select value={filters.role} onValueChange={(value) => handleFilterChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role, index) => (
                      <SelectItem key={index} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Key Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Collection Incharge", value: collectionData.collectionIncharge },
                { label: "Customer Name", value: collectionData.customerName },
                { label: "Segment", value: collectionData.segment },
                { label: "Package Name", value: collectionData.packageName },
                { label: "Total Outstanding", value: `₹${collectionData.totalOutstanding.toLocaleString("en-IN")}` },
                { label: "Not Due", value: `₹${collectionData.notDue.toLocaleString("en-IN")}` },
                { label: "Overdue", value: `₹${collectionData.overdue.toLocaleString("en-IN")}` },
                { label: "Due for this Month", value: `₹${collectionData.dueThisMonth.toLocaleString("en-IN")}` },
                { label: "Total Due for Plan", value: `₹${collectionData.totalDueForPlan.toLocaleString("en-IN")}` },
                {
                  label: "Plan Finalised",
                  value: `₹${collectionData.planFinalised.toLocaleString("en-IN")} (Manual Entry)`,
                },
                {
                  label: "Received",
                  value: `₹${collectionData.received.toLocaleString("en-IN")} (Link with Payment Advice)`,
                },
                {
                  label: "Statutory Deductions",
                  value: `₹${collectionData.statutoryDeductions.toLocaleString("en-IN")} (Link with Payment Advice)`,
                },
                {
                  label: "Balance",
                  value: `₹${balance.toLocaleString("en-IN")} (Plan - Received - Deductions)`,
                },
                {
                  label: "Target Achieved %",
                  value: `${targetAchieved.toFixed(2)}%`,
                },
              ].map((item, index) => (
                <div key={index} className="p-3 bg-white rounded border shadow-sm">
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="text-sm text-gray-900">{item.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-500">Collection Chart Area</p>
        </div>
      </div>
    </div>
  );
};

export default CollectionPlan;
