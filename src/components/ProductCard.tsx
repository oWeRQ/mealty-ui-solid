import { Component, Show } from 'solid-js';
import { IMealtyProduct } from '../mealty';

const ProductCard: Component<{ product: IMealtyProduct, onAdd?: () => void, onRemove?: () => void }> = (props) => {
    return (
        <div class="h-full flex flex-col">
            <div class="mb-2 text-lg flex justify-between">
                <span class="font-medium">{props.product.price}p</span>
                <Show when={props.onAdd}>
                    <button class="px-3 py-1 rounded-md ring-1 ring-indigo-600 text-sm opacity-30 hover:opacity-100" onClick={props.onAdd}>Add</button>
                </Show>
                <Show when={props.onRemove}>
                    <button class="px-3 py-1 rounded-md ring-1 ring-indigo-600 text-sm opacity-30 hover:opacity-100" onClick={props.onRemove}>Remove</button>
                </Show>
            </div>
            <img class="mb-2 object-cover object-center aspect-[4/3] overflow-hidden rounded-lg bg-gray-100" src={props.product.imageUrl} alt="" />
            <div>
                <span class="font-medium text-slate-900">
                    {props.product.name}
                </span>
                {' '}
                <span class="text-slate-400">
                    {props.product.note}
                </span>
            </div>
        </div>
    );
};

export default ProductCard;
