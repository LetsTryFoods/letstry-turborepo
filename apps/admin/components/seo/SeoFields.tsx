"use client";

import { useFormContext } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/custom/tag-input";

export function SeoFields() {
    const { control, watch } = useFormContext();

    const metaTitleLength = watch("metaTitle")?.length || 0;
    const metaDescLength = watch("metaDescription")?.length || 0;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">Meta Tags (Search Engines)</h3>

                <FormField
                    control={control}
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
                                <Input {...field} placeholder="Title for search engines" />
                            </FormControl>
                            <FormDescription>
                                Recommended: 50-60 characters.
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
                            <FormLabel className="flex items-center justify-between">
                                <span>Meta Description *</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Brief description for search engines" rows={3} />
                            </FormControl>
                            <FormDescription>
                                Recommended: 140-155 characters. Current: {metaDescLength}
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
                            <FormLabel>Meta Keywords (Optional)</FormLabel>
                            <FormControl>
                                <TagInput
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    placeholder="Add keyword and press Enter"
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
                                <Input {...field} placeholder="https://letstryfoods.com/..." />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">Social Media Sharing</h3>

                <FormField
                    control={control}
                    name="ogTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Social Title (Optional)</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Title when shared on social media" />
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
                            <FormLabel>Social Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Description when shared on social media" rows={2} />
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
                            <FormLabel>Social Image URL</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="https://..." />
                            </FormControl>
                            {field.value && (
                                <div className="mt-2">
                                    <img
                                        src={field.value}
                                        alt="OG Preview"
                                        className="max-h-40 rounded border mx-auto"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
