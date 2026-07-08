"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, GripVertical, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const GET_CATEGORY_PRODUCTS = gql`
  query GetCategoryProducts($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      _id
      name
      productOrder
      products {
        _id
        name
        defaultVariant {
          thumbnailUrl
        }
      }
    }
  }
`;

const REORDER_CATEGORY_PRODUCTS = gql`
  mutation ReorderCategoryProducts($input: ReorderCategoryProductsInput!) {
    reorderCategoryProducts(input: $input)
  }
`;

interface ProductOrderDialogProps {
  categorySlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductOrderDialog({
  categorySlug,
  isOpen,
  onClose,
}: ProductOrderDialogProps) {
  const { data, loading, error } = useQuery<any>(GET_CATEGORY_PRODUCTS, {
    variables: { slug: categorySlug },
    skip: !isOpen || !categorySlug,
    fetchPolicy: "network-only",
  });

  const [reorderProducts, { loading: saving }] = useMutation(
    REORDER_CATEGORY_PRODUCTS,
  );

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (data?.categoryBySlug?.products) {
      const fetchedProducts = [...data.categoryBySlug.products];
      const productOrder = data.categoryBySlug.productOrder || [];

      // Sort products exactly how the backend does it using the current productOrder
      if (productOrder.length > 0) {
        const orderMap = new Map<string, number>();
        productOrder.forEach((id: string, index: number) => {
          orderMap.set(id, index);
        });

        fetchedProducts.sort((a, b) => {
          const aIndex = orderMap.get(a._id);
          const bIndex = orderMap.get(b._id);

          if (aIndex !== undefined && bIndex !== undefined) {
            return aIndex - bIndex;
          }
          if (aIndex !== undefined) return -1;
          if (bIndex !== undefined) return 1;
          return 0;
        });
      }
      setProducts(fetchedProducts);
    }
  }, [data]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[index - 1];
    newProducts[index - 1] = temp;
    setProducts(newProducts);
  };

  const moveDown = (index: number) => {
    if (index === products.length - 1) return;
    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[index + 1];
    newProducts[index + 1] = temp;
    setProducts(newProducts);
  };

  const handleSave = async () => {
    if (!data?.categoryBySlug?._id) return;

    try {
      const orderedProductIds = products.map((p) => p._id);
      await reorderProducts({
        variables: {
          input: {
            categoryId: data.categoryBySlug._id,
            orderedProductIds,
          },
        },
      });
      toast.success("Product order saved successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to save product order");
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Manage Product Order: {data?.categoryBySlug?.name || "Loading..."}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 py-4">
          {loading && (
            <div className="flex items-center justify-center p-8">
              Loading products...
            </div>
          )}
          {error && (
            <div className="text-red-500 p-4 bg-red-50 rounded-md">
              Failed to load products. Please try again.
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="text-muted-foreground p-4 text-center">
              No products found in this category.
            </div>
          )}

          <div className="space-y-2">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="text-muted-foreground text-sm font-medium w-6 text-center">
                    {index + 1}
                  </div>
                  <div className="h-10 w-10 relative flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {product.defaultVariant?.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={`https://cdn.krishnaseth.xyz/${product.defaultVariant.thumbnailUrl}`}
                        alt={product.name}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <span className="font-medium truncate">{product.name}</span>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveDown(index)}
                    disabled={index === products.length - 1}
                    className="h-8 w-8"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || products.length === 0}>
            {saving ? "Saving..." : "Save Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
