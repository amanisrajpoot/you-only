import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from '@framework/settings';

interface Shop {
  id: number;
  name: string;
  slug: string;
  description: string;
  owner_id: number;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  logo: {
    id: number;
    original: string;
    thumbnail: string;
  };
  banner: {
    id: number;
    original: string;
    thumbnail: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  social_links: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_products: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

interface ShopContextType {
  shop: Shop | null;
  setShop: (shop: Shop | null) => void;
  shopId: number | null;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: settings } = useSettings();
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    // Use default shop from settings if no shop is set
    if (!shop && settings?.options?.defaultShop) {
      setShop(settings.options.defaultShop);
    }
  }, [shop, settings]);

  const shopId = shop?.id || null;

  const value = {
    shop,
    setShop,
    shopId,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
