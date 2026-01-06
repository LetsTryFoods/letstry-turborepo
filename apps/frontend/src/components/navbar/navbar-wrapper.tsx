import { getHomeCategories } from "@/lib/home";
import { Navbar } from "./navbar";

export const NavbarWrapper = async () => {
  let categories: Array<{ href: string; label: string }> = [];
  
  try {
    const categoryData = await getHomeCategories(20);
    categories = categoryData.items.map((c) => ({
      href: `/category/${c.slug}`,
      label: c.name,
    }));
  } catch (error) {
    categories = [];
  }

  return <Navbar categories={categories} />;
};
