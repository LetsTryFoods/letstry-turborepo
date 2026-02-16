"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { X } from "lucide-react";

interface FilterFormValues {
  sortBy: string;
  sortOrder: string;
  startDate: string;
  endDate: string;
  minSpent: string;
  maxSpent: string;
  cartStatus: string;
}

interface CustomerFiltersProps {
  onFilterChange: (values: FilterFormValues) => void;
  onClearFilters: () => void;
}

const formatDateForInput = (date?: Date): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function CustomerFilters({
  onFilterChange,
  onClearFilters,
}: CustomerFiltersProps) {
  const form = useForm<FilterFormValues>({
    defaultValues: {
      sortBy: "",
      sortOrder: "",
      startDate: "",
      endDate: "",
      minSpent: "",
      maxSpent: "",
      cartStatus: "",
    },
  });

  const handleClear = () => {
    form.reset();
    onClearFilters();
  };

  const watchedValues = form.watch();
  const hasActiveFilters = Object.values(watchedValues).some(
    (value) => value !== ""
  );

  return (
    <Form {...form}>
      <form
        onChange={() => onFilterChange(form.getValues())}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="sortBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort By</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFilterChange(form.getValues());
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CREATED_AT">Join Date</SelectItem>
                    <SelectItem value="TOTAL_SPENT">Total Spent</SelectItem>
                    <SelectItem value="TOTAL_ORDERS">Total Orders</SelectItem>
                    <SelectItem value="LAST_ACTIVE">Last Active</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFilterChange(form.getValues());
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ASC">Low to High</SelectItem>
                    <SelectItem value="DESC">High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minSpent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Spent (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onFilterChange(form.getValues());
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxSpent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Spent (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="No limit"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onFilterChange(form.getValues());
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onFilterChange(form.getValues());
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onFilterChange(form.getValues());
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cartStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cart Status</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onFilterChange(form.getValues());
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HAS_CART">Has Active Cart</SelectItem>
                    <SelectItem value="NO_CART">No Cart</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              <X className="mr-2 h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
