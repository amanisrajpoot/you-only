import React from "react";
import { useProductsInfinite } from "@framework/products";
import ProductInfiniteGrid from "@components/product/product-infinite-grid";
import { useShopIdWithFallback } from "../../hooks/use-shop-id";

type Props = {
  shopId?: string | number | null;
};

const ShopProductsGrid: React.FC<Props> = ({ shopId }) => {
  const fallbackShopId = useShopIdWithFallback(shopId);
  
  const {
    isLoading,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    hasNextPage,
    data,
    error,
  } = useProductsInfinite({
    ...(Boolean(fallbackShopId) && { shop_id: Number(fallbackShopId) }),
  });

  if (error) return <p>{error.message}</p>;

  return (
    <ProductInfiniteGrid
      loading={isLoading}
      data={data}
      hasNextPage={hasNextPage}
      loadingMore={loadingMore}
      fetchNextPage={fetchNextPage}
    />
  );
};

export default ShopProductsGrid;
