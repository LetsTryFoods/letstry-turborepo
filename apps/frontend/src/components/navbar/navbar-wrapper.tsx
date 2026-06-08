import { getHomeCategories } from "@/lib/home";
import { Navbar } from "./navbar";

export const NavbarWrapper = async () => {
  let categories: Array<{ href: string; label: string; favourite: boolean }> =
    [];

  try {
    const categoryData = await getHomeCategories(100);
    categories = categoryData.items.map((c) => ({
      href: `/${c.slug}`,
      label: c.name,
      favourite: c.favourite ?? false,
    }));
  } catch (error) {
    categories = [];
  }

  return <Navbar categories={categories} />;
};
