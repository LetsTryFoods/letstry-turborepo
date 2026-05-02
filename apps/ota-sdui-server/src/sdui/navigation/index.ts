import { FastifyRequest, FastifyReply } from 'fastify';

export const navigationHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  return {
    version: "1.0",
    activeColor: "#000000",
    inactiveColor: "#9E9E9E",
    labelFontSize: 14,
    tabs: [
      {
        id: "tab_home",
        name: "index",
        label: "Home",
        icon: "home",
        screenId: "home",
        order: 1
      },
      {
        id: "tab_categories",
        name: "categories",
        label: "Categories",
        icon: "grid",
        screenId: "categories_screen",
        order: 2
      },
      {
        id: "tab_loyalty",
        name: "loyalty",
        label: "Loyalty",
        icon: "star",
        screenId: "loyalty_dashboard",
        order: 3
      },
      {
        id: "tab_profile",
        name: "profile",
        label: "Profile",
        icon: "person",
        screenId: "profile_screen",
        order: 4
      }
    ]
  };
};
