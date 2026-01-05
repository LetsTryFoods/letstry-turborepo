import { getHomeCategories } from '@/lib/home';
import { CategoryCard } from './category-card';
import type { Category } from '@/types/category.types';

export const CategoryGrid = async () => {
  const data = await getHomeCategories(20);

  const mappedCategories: Category[] = data.items
    .filter((c) => c.favourite === true)
    .map((c) => ({
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl || '/placeholder-image.svg',
      href: `/category/${c.slug}`,
    }));

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-left">Find your favourite</h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-x-2 gap-y-6 sm:gap-6">
        {mappedCategories.map((c) => <CategoryCard key={c.id} category={c} />)}
      </div>
    </section>
  );
};

export default CategoryGrid;
