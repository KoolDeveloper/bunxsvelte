<script>

    import 'iconify-icon';

	let data = [
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

<style>
    @import url('https://fonts.googleapis.com/css2?family=Bree+Serif&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Bree+Serif&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

    .font-bree{
        font-family: 'Bree Serif', serif;
    }

    .font-roboto{
        font-family: 'Roboto', sans-serif;
    }

</style>

<div class="w-full flex justify-center">
    <button aria-label="Añadir Articulo"><iconify-icon icon="streamline-stickies-color:cancel-2-duo" width={'3rem'} class="transform rotate-45"></iconify-icon></button>
</div>
{#if data}
	<div class="grid grid-cols-2 xl:grid-cols-5 gap-4 p-6 text-center text-xl">
		{#each data as article}
			<a href={`/stock/${article.id}`}>
				<div class="group  hover:backdrop-brightness-200 p-3 rounded-2xl">
					<img src={article.imageUrl} alt={article.name} class="object-fit h-75 w-75 rounded-2xl" />
					<p class="group-hover:text-green-400 font-bree">${article.cost}</p>
					<p class="group-hover:text-green-400 font-roboto uppercase">{article.name}</p>
				</div>
			</a>
		{/each}
	</div>
{/if}