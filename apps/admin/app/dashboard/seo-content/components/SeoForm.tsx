"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { seoContentSchema, SeoContentFormData } from "@/lib/validations/seo.schema";
import { SeoContent } from "@/lib/seo/useSeo";
import { SeoFields } from "@/components/seo/SeoFields";

interface SeoFormProps {
  initialData?: SeoContent | null;
  onSubmit: (data: SeoContentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PAGE_OPTIONS = [
  { value: "home", label: "Home Page" },
  { value: "combos", label: "Combos Page" },
  { value: "about-us", label: "About Us" },
  { value: "contact", label: "Contact Page" },
  { value: "search", label: "Search Page" },
  { value: "products", label: "Products Page" },
  { value: "categories", label: "Categories Page" },
  { value: "cart", label: "Cart Page" },
  { value: "checkout", label: "Checkout Page" },
  { value: "faq", label: "FAQ Page" },
  { value: "privacy-policy", label: "Privacy Policy" },
  { value: "terms-of-service", label: "Terms of Service" },
  { value: "refund-policy", label: "Refund & Cancellations" },
  { value: "shipping-policy", label: "Shipping Policy" },
  { value: "address-details", label: "Address Details" },
];

export function SeoForm({ initialData, onSubmit, onCancel, isLoading }: SeoFormProps) {
  const methods = useForm<SeoContentFormData>({
    resolver: zodResolver(seoContentSchema),
    defaultValues: {
      pageName: initialData?.pageName || "",
      pageSlug: initialData?.pageSlug || "",
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      metaKeywords: initialData?.metaKeywords || "",
      canonicalUrl: initialData?.canonicalUrl || "",
      ogTitle: initialData?.ogTitle || "",
      ogDescription: initialData?.ogDescription || "",
      ogImage: initialData?.ogImage || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const metaTitle = methods.watch("metaTitle") || "";
  const metaDescription = methods.watch("metaDescription") || "";
  const metaTitleLength = metaTitle.length;
  const metaDescLength = metaDescription.length;

  const handlePageSelect = (slug: string) => {
    const page = PAGE_OPTIONS.find((p) => p.value === slug);
    if (page) {
      methods.setValue("pageSlug", slug);
      methods.setValue("pageName", page.label);
    }
  };

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={methods.control}
              name="pageSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Slug *</FormLabel>
                  <Select onValueChange={handlePageSelect} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    {...field}
                    placeholder="Or enter custom slug"
                    className="mt-2"
                  />
                  <FormDescription>URL identifier (lowercase, hyphens only)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Active</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Meta Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-600">Meta Tags (Search Engines)</h3>

            <FormField
              control={methods.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Meta Title *</span>
                    <Badge variant={metaTitleLength > 60 ? "destructive" : "default"}>
                      {metaTitleLength}/70
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Page title for search engines" />
                  </FormControl>
                  <FormDescription>Recommended: 50-60 characters. This appears as the clickable title in Google search results.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Meta Description *</span>
                    <Badge variant={metaDescLength > 155 ? "destructive" : "default"}>
                      {metaDescLength}/160
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Brief description of the page content" rows={3} />
                  </FormControl>
                  <FormDescription>Recommended: 140-155 characters. This appears below the title in Google search results.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="metaKeywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Keywords (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="organic food, healthy snacks, natural products" />
                  </FormControl>
                  <FormDescription>Comma-separated keywords related to this page</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="canonicalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canonical URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://letstryfoods.com/page" />
                  </FormControl>
                  <FormDescription>The preferred URL for this page (to avoid duplicate content issues)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Open Graph - Social Sharing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600">Social Media Sharing</h3>
            <p className="text-sm text-muted-foreground">
              These settings control how your page looks when shared on WhatsApp, Facebook, LinkedIn, etc.
            </p>

            <FormField
              control={methods.control}
              name="ogTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Title (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Title when shared on social media" />
                  </FormControl>
                  <FormDescription>Leave empty to use Meta Title</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="ogDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Description when shared on social media" rows={2} />
                  </FormControl>
                  <FormDescription>Leave empty to use Meta Description</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="ogImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://cdn.example.com/image.jpg" />
                  </FormControl>
                  <FormDescription>Image shown when page is shared. Recommended size: 1200x630 pixels</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t sticky bottom-0 bg-background py-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update SEO" : "Create SEO"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
