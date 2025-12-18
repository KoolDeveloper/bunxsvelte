<script lang="ts">
	import Gallery from '$lib/components/Layout/Gallery.svelte';
	import PathDisplay from '$lib/components/UI/PathDisplay.svelte';
    import type { Product } from '$lib/types/Product'


	let data : Product[] = [
		{
			id: '001',
			name: 'Camiseta (T-Shirt)',
			internal_cost: 12000,
			cost: 36000,
			available_sizes: { xl: 20, l: 10, m: 2, s: 500, u: 0 },
			color: 'white',
			imageUrl: '/assets/misaca.png'
		},
		{
			id: '002',
			name: 'pantaloncito',
			internal_cost: 30000,
			cost: 108000,
			available_sizes: { xl: 1, l: 1, m: 0, s: 10, u: 0 },
			color: 'blue',
			imageUrl: '/assets/pantaloncito.png'
		}
	];
</script>

<PathDisplay path="Inventario" />
<Gallery {data} />
