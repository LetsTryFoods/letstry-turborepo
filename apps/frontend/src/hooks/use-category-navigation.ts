import { useState, useEffect } from "react";
import { getHomeCategories } from "@/lib/home";

export const useCategoryNavigation = () => {
  const [categories, setCategories] = useState<
    Array<{ href: string; label: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getHomeCategories(20);
        const mappedCategories = categoryData.items.map((c) => ({
          href: `/${c.slug}`,
          label: c.name,
        }));
        setCategories(mappedCategories);
      } catch (error) {
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading };
};
