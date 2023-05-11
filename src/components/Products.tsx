import { Component, For, createResource } from 'solid-js';
import { IMealtyProduct, getProducts } from '../mealty';
import ProductCard from './ProductCard';

const Products: Component = () => {
    const [products] = createResource(getProducts);

    const selectProduct = (product: IMealtyProduct) => console.log('selectProduct', product);

    return (
        <div class="p-4">
            {/* <div class="mb-4 grid grid-cols-5 gap-x-4">
                <div ngFor="let products of productsByDay; let i = index" class="flex flex-col">
                    <h3 class="text-lg mb-2">
                        Day { i + 1 }
                        <button class="ml-4 text-sm opacity-30 hover:opacity-100" (click)="removeDay(i)">Remove</button>
                    </h3>
                    <div class="mb-2">
                        <app-products-summary [products]="products"></app-products-summary>
                    </div>
                    <div class="flex-grow p-4 grid grid-cols-2 gap-x-4 gap-y-8 bg-gray-100 rounded-lg">
                        <app-product-card *ngFor="let product of products" [product]="product" (remove)="unselectProduct(product)"></app-product-card>
                    </div>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <button class="inline-flex justify-center rounded-md bg-indigo-600 py-3 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" (click)="addDay()">Add Day</button>
                <div>
                    <div class="text-gray-500">Summary:</div>
                    <app-products-summary [products]="selectedProducts"></app-products-summary>
                </div>
            </div>
            <hr class="my-4" />
            */}

            <h2 class="text-xl font-bold mb-2">Available</h2>
            <div class="p-4 grid grid-cols-8 gap-x-4 gap-y-8">
                <For each={products()}>
                    {product => (<ProductCard product={product} onAdd={() => selectProduct(product)} />)}
                </For>
            </div>
        </div>
    );
};

export default Products;