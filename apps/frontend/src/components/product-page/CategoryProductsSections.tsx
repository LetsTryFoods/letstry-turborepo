import { getCategoriesByIds } from "@/lib/category/get-categories-by-ids";
import { getProductsByCategoryId } from "@/lib/product/get-products-by-category-id";
import { CategoryProductSection } from "./CategoryProductSection";

interface CategoryProductsSectionsProps {
  categoryIds: string[];
}

export const CategoryProductsSections: React.FC<
  CategoryProductsSectionsProps
> = async ({ categoryIds }) => {
  if (!categoryIds || categoryIds.length === 0) {

    return null;
  }


  const categories = await getCategoriesByIds(categoryIds);


  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => {
      const products = await getProductsByCategoryId(category.id, 10);
      return {
        category,
        products,
      };
    })
  );

  const validCategories = categoriesWithProducts.filter(
    ({ products }) => products.length > 0
  );


  if (validCategories.length === 0) {
    return null;
  }

  return (
    <>
      {validCategories.map(({ category, products }) => (
        <CategoryProductSection
          key={category.id}
          categoryName={category.name}
          categorySlug={category.slug}
          products={products}
        />
      ))}
    </>
  );
};
