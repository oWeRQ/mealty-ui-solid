export type IMealtyCategory = {
    id: string;
    name: string;
    title: string;
};
  
export type IMealtyProduct = {
    category: IMealtyCategory,
    meta: Record<string, string>,
    id: string;
    sellerId: string;
    priority: string;
    heatable: string;
    newProduct: string;
    imageUrl: string;
    name: string;
    note: string;
    price: string;
};
  
export type IMealtyCategoryWithProducts = IMealtyCategory & {
    products: IMealtyProduct[];
};

export const getProducts = async (): Promise<IMealtyProduct[]> => (await fetch(`http://localhost:3001/api/v1/products`)).json();

export const getCategories = async (): Promise<IMealtyProduct[]> => (await fetch(`http://localhost:3001/api/v1/categories`)).json();
