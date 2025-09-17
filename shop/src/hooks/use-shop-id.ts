import { useShop } from '@contexts/shop.context';

export const useShopId = (): number | null => {
  const { shopId } = useShop();
  return shopId;
};

export const useShopIdWithFallback = (providedShopId?: number | string | null): number | null => {
  const { shopId } = useShop();
  
  // If a shop_id is provided, use it
  if (providedShopId !== undefined && providedShopId !== null) {
    return Number(providedShopId);
  }
  
  // Otherwise, use the context shop_id
  return shopId;
};
