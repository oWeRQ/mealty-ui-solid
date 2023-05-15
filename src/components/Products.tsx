import { Component, For, createEffect, createMemo, createResource, createSignal } from 'solid-js';
import { arrayRange } from '../functions/arrayRange';
import { gcd } from '../functions/gcd';
import useLocalStorage from '../hooks/useLocalStorage';
import { IMealtyCategoryWithProducts, IMealtyProduct, fetchCategories } from '../mealty';
import ProductCard from './ProductCard';
import ProductsSummary from './ProductsSummary';

const Products: Component = () => {
    const [search, setSearch] = createSignal('');
    const [maxPrice, setMaxPrice] = createSignal<number>(Infinity);
    const [productsByDay, setProductsByDay] = createSignal<IMealtyProduct[][]>([]);
    const [selectedCategories, setSelectedCategories] = createSignal<IMealtyCategoryWithProducts[]>([]);

    const [productsByDayStorage, setProductsByDayStorage] = useLocalStorage<string[][]>('productsByDay', []);
    const [dayLimit, setDayLimit] = useLocalStorage('dayLimit', 370);

    const [categories] = createResource(fetchCategories);

    const categoriesUnique = createMemo(() => categories()?.filter(c => c.id != '0'));

    const allProducts = createMemo(() => {
        return categoriesUnique()?.flatMap(c => c.products);
    });

    const selectableProducts = createMemo(() => {
        const categoriesValue = selectedCategories().length ? selectedCategories() : categoriesUnique() ?? [];
        return categoriesValue.flatMap(c => c.products);
    });

    const currentDayPrice = createMemo(() => productsByDay().at(-1)?.reduce((acc, cur) => acc + +cur.price, 0) ?? 0);

    const priceRange = createMemo(() => arrayRange(selectableProducts().map(p => +p.price)));

    const priceStep = createMemo(() => gcd(priceRange()[0], priceRange()[1]));

    const selectedProducts = createMemo(() => productsByDay().flat());

    const availableProducts = createMemo(() => {
        const without = new Set(selectedProducts());
        const searchValue = search().toLowerCase();
        return selectableProducts()?.filter(product => {
            if (without.has(product))
                return false;

            if (+product.price > maxPrice())
                return false;
            
            return (
                product.name.toLowerCase().includes(searchValue) ||
                product.note.toLowerCase().includes(searchValue)
            );
        }) ?? [];
    });

    const addDay = () => {
        setProductsByDay(days => [...days, []]);
    };

    const removeDay = (index: number) => {
        if (productsByDay()[index].length && !confirm(`Remove day ${index + 1}`))
            return;

        setProductsByDay(days => days.filter((_, i) => i !== index));
    };

    const selectProduct = (product: IMealtyProduct) => {
        setProductsByDay((days) => {
            return [...days.slice(0, -1), [...(days.at(-1) ?? []), product]];
        });
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
    };

    const toggleCategory = (category: IMealtyCategoryWithProducts) => {
        setSelectedCategories(selected => {
            if (selected.includes(category)) {
                return selected.filter(c => c !== category);
            } else {   
                return [...selected, category];
            }
        });
    };

    let isStorageLoaded = false;

    createEffect(() => {
        const productsByDayValue = productsByDay();
        if (isStorageLoaded) {
            const getProductIds = (products: IMealtyProduct[]) => products.map((product) => product.id);
            setProductsByDayStorage(productsByDayValue.map(getProductIds));
        }
    });

    createEffect(() => {
        try {
            const allProductsValue = allProducts();
            if (allProductsValue) {
                const getProducts = (productIds: string[]) => allProductsValue.filter((product) => productIds.includes(product.id));
                setProductsByDay(productsByDayStorage().map(getProducts));
                isStorageLoaded = true;
            }
        } catch (e) {}
    });

    createEffect(() => {
        const maxPriceValue = dayLimit() - currentDayPrice();
        const [priceFrom, priceTo] = priceRange();

        if (maxPriceValue >= priceFrom) {
            setMaxPrice(Math.min(priceTo, maxPriceValue));
        } else {
            setMaxPrice(priceTo);
            if (currentDayPrice() > 0) {
                addDay();
            }
        }
    });

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
                            <For each={products} fallback={<div class="text-slate-400">No items</div>}>
                                {product => (<ProductCard product={product} onRemove={() => unselectProduct(product)} />)}
                            </For>
                        </div>
                    </div>}
                </For>
            </div>
            <div class="flex justify-between items-center">
                <div>
                    <button class="inline-flex justify-center rounded-md bg-indigo-600 py-3 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" onClick={addDay}>Add Day</button>
                    <span class="mx-4">Day limit:</span>
                    <input
                        class="p-2 w-[100px] ring-1 rounded-md"
                        type="number"
                        min={priceRange()[0]}
                        value={dayLimit()}
                        onInput={e => setDayLimit(+e.currentTarget.value)}
                    />
                </div>
                <div>
                    <div class="text-gray-500">Summary:</div>
                    <ProductsSummary products={selectedProducts()} />
                </div>
            </div>
            <hr class="my-4" />

            <h2 class="text-xl font-bold mb-2">
                Available
                <span class="text-slate-400"> ({availableProducts().length})</span>
            </h2>
            <div>
                <For each={categoriesUnique()}>
                    {category => (
                        <label class="mr-4">
                            <input type="checkbox" onChange={() => toggleCategory(category)} /> {category.title}
                        </label>
                    )}
                </For>
            </div>
            <div>
                Price:
                <input
                    class="m-2 align-middle"
                    type="range"
                    min={priceRange()[0]}
                    max={priceRange()[1]}
                    step={priceStep()}
                    value={maxPrice()}
                    onInput={e => setMaxPrice(+e.currentTarget.value)}
                />
                {maxPrice()}
            </div>
            <input
                type="text"
                value={search()}
                onInput={e => setSearch(e.currentTarget.value)}
                placeholder='Search...'
            />
            <div class="p-4 grid grid-cols-8 gap-x-4 gap-y-8">
                <For each={availableProducts()} fallback={<div class="text-slate-400">No items</div>}>
                    {product => (<ProductCard product={product} onAdd={() => selectProduct(product)} />)}
                </For>
            </div>
        </div>
    );
};

export default Products;