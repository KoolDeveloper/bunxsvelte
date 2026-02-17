import type { PageServerLoad } from "./$types";
import { ProductService } from "$lib/server/products";

export const load: PageServerLoad = async ()=>{
    const products = await ProductService.getAll();

    return {
        products
    }
}