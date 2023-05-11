import { Component, For, createEffect, createResource, createSignal, on } from 'solid-js';
import { IMealtyProduct, fetchProducts } from '../mealty';
import ProductCard from './ProductCard';
import ProductsSummary from './ProductsSummary';

const Products: Component = () => {
    const [search, setSearch] = createSignal('');
    const [products] = createResource(fetchProducts);
    const [productsByDay, setProductsByDay] = createSignal<IMealtyProduct[][]>([]);

    const selectedProducts = () => productsByDay().flat();

    const availableProducts = () => {
        const without = new Set(selectedProducts());
        const searchValue = search().toLowerCase();
        return products()?.filter(product => {
            if (without.has(product))
                return false;
            
            return (
                product.name.toLowerCase().includes(searchValue) ||
                product.note.toLowerCase().includes(searchValue)
            );
        });
    };

    const saveStorage = () => {
        const data = productsByDay().map((products) => products.map((product) => product.id));
        window.localStorage.setItem('productsByDay', JSON.stringify(data));
    };

    const loadStorage = () => {
        try {
            const productsValue = products() ?? [];
            const data: string[][] = JSON.parse(window.localStorage.getItem('productsByDay') || '[]');
            setProductsByDay(data.map((productIds) => productsValue.filter((product) => productIds.includes(product.id))));
        } catch (e) {}
    };

    const addDay = () => {
        setProductsByDay(days => [...days, []]);
    };

    const removeDay = (index: number) => {
        if (productsByDay()[index].length && !confirm(`Remove day ${index + 1}`))
            return;

        setProductsByDay(days => days.filter((_, i) => i !== index));

        saveStorage();
    };
    
    const selectProduct = (product: IMealtyProduct) => {
        setProductsByDay((days) => {
            return [...days.slice(0, -1), [...(days.at(-1) ?? []), product]];
        });

        saveStorage();
    };

    const unselectProduct = (product: IMealtyProduct) => {
        setProductsByDay((days) => {
            return days.map(products => {
                if (products.includes(product)) {
                    return products.filter(p => p !== product);
                }

                return products;
            });
        });

        saveStorage();
    };

    createEffect(on(products, loadStorage, { defer: true }));

    return (
        <div class="p-4">
            <div class="mb-4 grid grid-cols-5 gap-x-4">
                <For each={productsByDay()}>
                    {(products, index) => <div class="flex flex-col">
                        <h3 class="text-lg mb-2">
                            Day { index() + 1 }
                            <button class="ml-4 text-sm opacity-30 hover:opacity-100" onClick={() => removeDay(index())}>Remove</button>
                        </h3>
                        <div class="mb-2">
                            <ProductsSummary products={products} />
                        </div>
                        <div class="flex-grow p-4 grid grid-cols-2 gap-x-4 gap-y-8 bg-gray-100 rounded-lg">
                            <For each={products}>
                                {product => (<ProductCard product={product} onRemove={() => unselectProduct(product)} />)}
                            </For>
                        </div>
                    </div>}
                </For>
            </div>
            <div class="flex justify-between items-center">
                <button class="inline-flex justify-center rounded-md bg-indigo-600 py-3 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" onClick={addDay}>Add Day</button>
                <div>
                    <div class="text-gray-500">Summary:</div>
                    <ProductsSummary products={selectedProducts()} />
                </div>
            </div>
            <hr class="my-4" />

            <h2 class="text-xl font-bold mb-2">Available</h2>
            <input
                type="text"
                value={search()}
                onInput={e => setSearch(e.currentTarget.value)}
                placeholder='Search...'
            />
            <div class="p-4 grid grid-cols-8 gap-x-4 gap-y-8">
                <For each={availableProducts()}>
                    {product => (<ProductCard product={product} onAdd={() => selectProduct(product)} />)}
                </For>
            </div>
        </div>
    );
};

export default Products;