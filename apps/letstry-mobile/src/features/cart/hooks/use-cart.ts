import { useQuery } from "@apollo/client";
import { GET_MY_CART } from "../../../lib/graphql/cart";

export const useCart = () => {
  return useQuery(GET_MY_CART, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      console.log(
        "[useCart] totalsSummary from backend:",
        JSON.stringify(data?.myCart?.totalsSummary, null, 2),
      );
    },
  });
};
