import { getHomeCategories } from '@/lib/home';
import { CategoryCard } from './category-card';
import type { Category } from '@/types/category.types';

export const CategoryGrid = async () => {
  const data = await getHomeCategories(20);
  
  const mappedCategories: Category[] = data.items.map((c) => ({
    id: c.id,
    name: c.name,
    imageUrl: c.imageUrl || '/placeholder-image.svg',
    href: `/category/${c.slug}`,
  }));

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-extrabold mb-6">Find your favourite</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {mappedCategories.map((c) => <CategoryCard key={c.id} category={c} />)}
      </div>
    </section>
  );
};

export default CategoryGrid;
