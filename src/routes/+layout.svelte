<script>
  import Header from "$lib/components/Header.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import "../app.css";
</script>

<div class="flex flex-col min-h-screen">
<Header>
  <Nav />
</Header>

<div class="flex flex-1 justify-center items-center">
  <slot />
</div>

<footer class="flex items-center justify-center w-full py-4 text-sm">
  <p class="mr-4">&copy; 2023-2024 whatifmachine.ai</p>
  <a href="https://github.com/aviato" target="_blank">created by Ryan Price</a>
</footer>
</div>
