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

export const apiResource = <T>(resource: string) => async (): Promise<T> => (await fetch(`http://localhost:3001/api/v1/${resource}`)).json();

export const fetchProducts = apiResource<IMealtyProduct[]>('products');

export const fetchCategories = apiResource<IMealtyCategoryWithProducts[]>('categories');
