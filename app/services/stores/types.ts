export type StoreOffer = {
    id: string;
    title: string;
    store: string;
    price: number;
    shipping: number;
    shippingText: string;
    inStock: boolean;
    productUrl: string;
    imageUrl: string;
    rating: number | null;
    reviews: number | null;
  };
  
  export type StoreSearchResult = {
    store: string;
    offers: StoreOffer[];
    error?: string;
  };