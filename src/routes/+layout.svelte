<script>
  import Header from "$lib/components/Header.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import "../app.css";
</script>

<Header>
  <Nav />
</Header>

<div class="h-screen">
  <slot />
</div>
