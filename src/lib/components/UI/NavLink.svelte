<script>
	let { text, icon, href } = $props();
</script>

<li>
	<a {href}
		><div class="grid place-content-center group">
			<iconify-icon {icon} width={'3rem'} class="group-hover:animate-bounce"></iconify-icon>
            <p class="text-xl group-hover:text-green-300">{text}</p>
		</div>
	</a>
</li>
