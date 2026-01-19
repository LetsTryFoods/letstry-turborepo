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
    <section className="container py-4 px-4 sm:px-8 sm:py-8 mx-auto">
      <h2 className="text-xl mb-2 sm:mb-6 sm:text-2xl md:text-3xl font-bold text-left">Find your favourite</h2>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-8 gap-y-4 sm:gap-x-8 sm:gap-y-8 md:gap-x-12 md:gap-y-10">
        {mappedCategories.map((c) => <CategoryCard key={c.id} category={c} />)}
      </div>
    </section>
  );
};

export default CategoryGrid;
