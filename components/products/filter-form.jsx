"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function FilterForm({ filters, onFilterChange, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (value) => {
    setLocalFilters(prev => ({ ...prev, min_price: value[0], max_price: value[1] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
    onApplyFilters();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filter Products</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                name="search"
                placeholder="Search by name, description..."
                value={localFilters.search || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" value={localFilters.category || "all"} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  {/* Add more categories as needed */}
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label htmlFor="status_item">Item Status</Label>
                <Select name="status_item" value={localFilters.status_item || "all"} onValueChange={(value) => handleSelectChange("status_item", value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select item status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select name="sort" value={localFilters.sort || "-date_created"} onValueChange={(value) => handleSelectChange("sort", value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-date_created">Newest First</SelectItem>
                        <SelectItem value="date_created">Oldest First</SelectItem>
                        <SelectItem value="-price">Price: High to Low</SelectItem>
                        <SelectItem value="price">Price: Low to High</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Price Range: {localFilters.min_price || 0} - {localFilters.max_price || 5000}</Label>
            <Slider
              defaultValue={[0, 5000]}
              max={10000}
              step={100}
              onValueChange={handlePriceChange}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Apply Filters</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
