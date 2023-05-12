import { Component, For, createEffect, createMemo, createResource, createSignal, on } from 'solid-js';
import { IMealtyCategoryWithProducts, IMealtyProduct, fetchCategories } from '../mealty';
import ProductCard from './ProductCard';
import ProductsSummary from './ProductsSummary';
import { arrayRange } from '../functions/arrayRange';
import { gcd } from '../functions/gcd';

const Products: Component = () => {
    const [dayLimit, setDayLimit] = createSignal(370);
    const [search, setSearch] = createSignal('');
    const [maxPrice, setMaxPrice] = createSignal<number>(Infinity);
    const [productsByDay, setProductsByDay] = createSignal<IMealtyProduct[][]>([]);
    const [selectedCategories, setSelectedCategories] = createSignal<IMealtyCategoryWithProducts[]>([]);
    const [categories] = createResource(fetchCategories);

    const categoriesUnique = createMemo(() => categories()?.filter(c => c.id != '0'));

    const allProducts = createMemo(() => {
        return categoriesUnique()?.flatMap(c => c.products);
    });

    const selectableProducts = createMemo(() => {
        const categoriesValue = selectedCategories().length ? selectedCategories() : categoriesUnique() ?? [];
        return categoriesValue.flatMap(c => c.products);
    });

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

    const saveStorage = () => {
        const data = productsByDay().map((products) => products.map((product) => product.id));
        window.localStorage.setItem('productsByDay', JSON.stringify(data));
    };

    const loadStorage = () => {
        try {
            const productsValue = allProducts() ?? [];
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

    const toggleCategory = (category: IMealtyCategoryWithProducts) => {
        setSelectedCategories(selected => {
            if (selected.includes(category)) {
                return selected.filter(c => c !== category);
            } else {   
                return [...selected, category];
            }
        });
    };

    const checkLimit = () => {
        const currentDayPrice = productsByDay().at(-1)?.reduce((acc, cur) => acc + +cur.price, 0) ?? 0;
        const maxPriceValue = dayLimit() - currentDayPrice;
        console.log('checkLimit', maxPriceValue, priceRange()[0]);

        if (maxPriceValue >= priceRange()[0]) {
            setMaxPrice(maxPriceValue);
        } else {
            setMaxPrice(priceRange()[1]);
            addDay();
        }
    };

    createEffect(checkLimit);

    createEffect(on(allProducts, loadStorage, { defer: true }));

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
                        min={1}
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