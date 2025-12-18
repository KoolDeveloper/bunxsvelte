<script lang="ts">
	import 'iconify-icon';
	import type { Product } from '$lib/types/Product';

	export let data: Product[] = [];
</script>

<div class="flex w-full justify-center">
	<button aria-label="Añadir Articulo"
		><iconify-icon
			icon="streamline-stickies-color:cancel-2-duo"
			width={'3rem'}
			class="rotate-45 transform"
		></iconify-icon></button
	>
</div>

{#if data}
	<div class="grid gap-4 p-6 text-center text-xl md:grid-cols-2 xl:grid-cols-5">
		{#each data as article}
			<a href={`/stock/${article.id}`}>
				<div class="group rounded-2xl p-3 hover:backdrop-brightness-200">
					<img src={article.imageUrl} alt={article.name} class="object-fit h-75 w-75 rounded-2xl" />
					<p class="font-bree group-hover:text-green-400">${article.cost}</p>
					<p class="font-roboto uppercase group-hover:text-green-400">{article.name}</p>
				</div>
			</a>
		{/each}
	</div>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bree+Serif&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Bree+Serif&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

	.font-bree {
		font-family: 'Bree Serif', serif;
	}

	.font-roboto {
		font-family: 'Roboto', sans-serif;
	}
</style>
