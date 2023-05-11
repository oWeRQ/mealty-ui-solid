import { Component } from 'solid-js';
import { IMealtyProduct } from '../mealty';

const ProductsSummary: Component<{ products: IMealtyProduct[] }> = (props) => {
    const price = () => {
        return props.products.reduce((acc, cur) => acc + +cur.price, 0);
    }

    const weight = () => {
        return props.products.reduce((acc, cur) => acc + +cur.meta['weight'], 0);
    }

    const calories = () => {
        return props.products.reduce((acc, cur) => acc + +cur.meta['calories__portion'], 0);
    }

    return (
        <div class="self-center flex justify-between gap-4">
            <div>
                <span class="text-slate-400">Price: </span><b>{price()}p</b>
            </div>
            <div>
                <span class="text-slate-400">Weight: </span><b>{weight()}g</b>
            </div>
            <div>
                <span class="text-slate-400">Calories: </span><b>{calories()}</b>
            </div>
        </div>
    );
};

export default ProductsSummary;
