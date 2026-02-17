import type { Product } from '$lib/types/Product';

export const ProductService = {
	async getAll(): Promise<Product[]> {
		const data: Product[] = [
			{
				id: '001',
				name: 'Camiseta (T-Shirt)',
				internal_price: 12000,
				price: 36000,
				available_sizes: { xl: 20, l: 10, m: 2, s: 500, u: 0 },
				count: 532,
				color: 'white',
				imageUrl: '/assets/misaca.png'
			},
			{
				id: '002',
				name: 'pantaloncito',
				internal_price: 30000,
				price: 108000,
				available_sizes: { xl: 1, l: 1, m: 0, s: 10, u: 0 },
				count: 12,
				color: 'blue',
				imageUrl: '/assets/pantaloncito.png'
			}
		];

		return data;
	}
};
