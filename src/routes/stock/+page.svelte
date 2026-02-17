<script lang="ts">
	import Gallery from '$lib/components/Layout/Gallery.svelte';
	import PathDisplay from '$lib/components/UI/PathDisplay.svelte';
	import type { PageData } from '../$types';

	export let data: PageData;
	$: products = data?.products ?? [];

</script>

<PathDisplay path="Inventario" />
<Gallery data={products} />