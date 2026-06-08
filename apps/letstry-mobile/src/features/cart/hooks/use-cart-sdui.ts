import { useQuery as useRestQuery } from "@tanstack/react-query";
import { SDUIService } from "../../home/services/sdui.service";

export const useCartSDUI = () => {
  const { data: sduiData, isLoading: loading } = useRestQuery({
    queryKey: ["sdui", "cart"],
    queryFn: () => SDUIService.getScreenConfig("cart"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const sduiConfig = sduiData?.config || null;
  const sduiComponents = sduiData?.components || [];

  return { sduiConfig, sduiComponents, loading };
};
