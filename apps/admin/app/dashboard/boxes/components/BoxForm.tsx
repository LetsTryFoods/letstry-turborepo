"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/custom/image-upload";
import { getCdnUrl, extractKeyFromUrl } from "@/lib/image-utils";

interface BoxFormProps {
  onClose: () => void;
  initialData?: any;
  createBox: (input: any) => void;
  updateBox: (boxId: string, input: any) => void;
}

export function BoxForm({ onClose, initialData, createBox, updateBox }: BoxFormProps) {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]); // stores R2 keys only
  const [initialImages, setInitialImages] = useState<{ url: string; alt: string }[]>([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    lengthInches: 0,
    breadthInches: 0,
    heightInches: 0,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || "",
        name: initialData.name || "",
        lengthInches: initialData.lengthInches || 0,
        breadthInches: initialData.breadthInches || 0,
        heightInches: initialData.heightInches || 0,
        isActive: initialData.isActive !== false,
      });

      // Set existing photos as R2 keys
      const existingPhotos: string[] = initialData.photos || [];
      setPhotos(existingPhotos);

      // For ImageUpload initial display — pass full CDN URLs
      setInitialImages(
        existingPhotos.map((key: string) => ({
          url: getCdnUrl(key),
          alt: "Box Photo",
        }))
      );
    }
  }, [initialData]);

  // Exactly like VariantImageUpload in product-form.tsx
  const handleImagesChange = useCallback(
    (
      newImages: Array<{
        file: File | null;
        alt: string;
        preview: string;
        finalUrl?: string;
        key?: string;
      }>
    ) => {
      const keys = newImages.map(
        (img) =>
          img.key ||
          extractKeyFromUrl(img.finalUrl) ||
          extractKeyFromUrl(img.preview) ||
          ""
      ).filter(Boolean);

      setPhotos(keys);
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length < 1) {
      alert("Please upload at least 1 photo.");
      return;
    }

    setLoading(true);

    const lengthCm = Number((formData.lengthInches * 2.54).toFixed(2));
    const breadthCm = Number((formData.breadthInches * 2.54).toFixed(2));
    const heightCm = Number((formData.heightInches * 2.54).toFixed(2));

    const payload = {
      code: formData.code,
      name: formData.name,
      lengthInches: formData.lengthInches,
      breadthInches: formData.breadthInches,
      heightInches: formData.heightInches,
      lengthCm,
      breadthCm,
      heightCm,
      isActive: formData.isActive,
      photos,
    };

    if (initialData?.id || initialData?._id) {
      await updateBox(initialData.id || initialData._id, payload);
    } else {
      await createBox(payload);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Box Code</Label>
          <Input
            id="code"
            name="code"
            required
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., BOX-A"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Box Name</Label>
          <Input
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Small Box"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lengthInches">Length (inches)</Label>
          <Input
            id="lengthInches"
            name="lengthInches"
            type="number"
            step="0.1"
            required
            value={formData.lengthInches}
            onChange={handleChange}
          />
          <span className="text-xs text-muted-foreground">
            {(formData.lengthInches * 2.54).toFixed(2)} cm
          </span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="breadthInches">Breadth (inches)</Label>
          <Input
            id="breadthInches"
            name="breadthInches"
            type="number"
            step="0.1"
            required
            value={formData.breadthInches}
            onChange={handleChange}
          />
          <span className="text-xs text-muted-foreground">
            {(formData.breadthInches * 2.54).toFixed(2)} cm
          </span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="heightInches">Height (inches)</Label>
          <Input
            id="heightInches"
            name="heightInches"
            type="number"
            step="0.1"
            required
            value={formData.heightInches}
            onChange={handleChange}
          />
          <span className="text-xs text-muted-foreground">
            {(formData.heightInches * 2.54).toFixed(2)} cm
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isActive: checked }))
          }
        />
        <Label htmlFor="isActive">Active Status</Label>
      </div>

      {/* Photos — same pattern as VariantImageUpload in product-form */}
      <div className="space-y-2">
        <Label>Box Photos ({photos.length} uploaded)</Label>
        <ImageUpload
          onImagesChange={handleImagesChange}
          initialImages={initialImages}
          maxFiles={10}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Box" : "Create Box"}
        </Button>
      </div>
    </form>
  );
}
