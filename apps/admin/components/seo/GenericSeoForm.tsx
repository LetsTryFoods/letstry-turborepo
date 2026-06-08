"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/custom/tag-input";
import { seoSchema, SeoFormData } from "@/lib/validations/seo.schema";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface GenericSeoFormProps {
  initialData?: SeoFormData | null;
  entityName: string;
  entitySlug: string;
  entityType: string;
  entityImageUrl?: string;
  onSubmit: (data: SeoFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel: () => void;
}

export function GenericSeoForm({
  initialData,
  entityName,
  entitySlug,
  entityType,
  entityImageUrl,
  onSubmit,
  isLoading,
  onCancel,
}: GenericSeoFormProps) {
  const form = useForm<SeoFormData>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      metaTitle: initialData?.metaTitle || `${entityName} - Buy Online`,
      metaDescription:
        initialData?.metaDescription ||
        `Explore our high-quality ${entityName}.`,
      metaKeywords: initialData?.metaKeywords || [],
      canonicalUrl: initialData?.canonicalUrl || "",
      ogTitle: initialData?.ogTitle || "",
      ogDescription: initialData?.ogDescription || "",
      ogImage: initialData?.ogImage || entityImageUrl || "",
    },
  });

  const metaTitleLength = form.watch("metaTitle")?.length || 0;
  const metaDescLength = form.watch("metaDescription")?.length || 0;

  const handleSubmit = async (data: SeoFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error(`Failed to save ${entityType} SEO:`, error);
    }
  };

  const control = form.control as any;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
      >
        <div className="bg-muted/30 p-4 rounded-lg border flex items-start gap-4">
          {entityImageUrl && (
            <img
              src={entityImageUrl}
              alt={entityName}
              className="w-16 h-16 object-cover rounded border"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{entityName}</h4>
            <p className="text-xs text-muted-foreground font-mono">
              /{entitySlug}
            </p>
            <Badge variant="outline" className="mt-1">
              {entityType}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-4">
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-green-600">
              <Globe className="h-4 w-4" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">
                Search Engine Optimization
              </h3>
            </div>

            <FormField
              control={control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between">
                    <span>Meta Title *</span>
                    <span
                      className={cn(
                        "text-[10px]",
                        metaTitleLength > 60
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {metaTitleLength}/70
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Search result title" {...field} />
                  </FormControl>
                  <FormDescription className="text-[10px]">
                    50-60 characters recommended.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between">
                    <span>Meta Description *</span>
                    <span
                      className={cn(
                        "text-[10px]",
                        metaDescLength > 155
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {metaDescLength}/160
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Search result snippet"
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[10px]">
                    140-155 characters recommended.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="metaKeywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Keywords</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Type and press enter"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="canonicalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canonical URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column: Social & Preview */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Globe className="h-4 w-4" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">
                Social Sharing (OG)
              </h3>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <FormField
                control={control}
                name="ogTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Social Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Same as Meta Title if empty"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="ogDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Social Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Same as Meta Description if empty"
                        className="h-20 resize-none text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="ogImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Social Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Visual Preview */}
            <div className="mt-4 p-4 rounded-lg border bg-white shadow-sm overflow-hidden">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                Google Preview
              </p>
              <div className="space-y-1">
                <p className="text-xs text-[#202124] truncate">
                  letstryfoods.com ›{" "}
                  <span className="text-[#5f6368]">{entitySlug}</span>
                </p>
                <h3 className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer leading-tight">
                  {form.watch("metaTitle") || entityName}
                </h3>
                <p className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
                  {form.watch("metaDescription") ||
                    "No description provided. Search engines will pull content from your page."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-background pb-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
