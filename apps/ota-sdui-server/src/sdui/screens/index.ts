import { FastifyRequest, FastifyReply } from "fastify";
import { homeScreen } from "./home";
import { cartScreen } from "./cart";
import { loyaltyScreen } from "./loyalty";
import { categoriesScreen } from "./categories";
import { profileScreen } from "./profile";
import { productDetailScreen } from "./product_detail";
import { SDUIScreen } from "../types";

const screenRegistry: Record<string, SDUIScreen> = {
  home: homeScreen,
  cart: cartScreen,
  loyalty_dashboard: loyaltyScreen,
  categories_screen: categoriesScreen,
  profile_screen: profileScreen,
  product_detail_screen: productDetailScreen,
};

export const screenHandler = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = req.params as { id: string };

  const screenDefinition = screenRegistry[id];

  if (screenDefinition) {
    return screenDefinition;
  }

  reply.status(404);
  return { error: `Screen definition for '${id}' not found` };
};
