<script>
    import 'iconify-icon';
    import NavLink from '../UI/NavLink.svelte';
</script>

<header class="pt-4 px-4 ">
    <nav>
        <ul class="w-full flex justify-center text-2xl gap-4 md:gap-8">
            <NavLink href="/" icon="streamline-stickies-color:globe-1-duo" text="Inicio" />
            <NavLink href="/stock" icon="streamline-stickies-color:slate" text="Inventario"/>
            <NavLink href="/customers" icon="streamline-stickies-color:baby" text="Clientes"/>
            <NavLink href="/sales" icon="streamline-stickies-color:reciept-1-duo" text="Ventas"/>
            <NavLink href="/dashboard" icon ="streamline-stickies-color:add-device" text="Dashboard" />
        </ul>
    </nav>
</header>