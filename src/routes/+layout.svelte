<script>
  import "../app.css";
</script>

<nav
  class="h-16 flex align-middle justify-between px-16 sticky dark:text-white"
>
  <div class="flex align-middle">
    <a href="/" class="self-center">Whatifmachine.ai</a>
  </div>
  <div class="flex align-middle">
    <!-- <section class="self-center">
      <label for="dark-mode-toggle">Dark Mode</label>
      <input type="checkbox" name="dark-mode-toggle" />
    </section> -->
    <a href="/answers" class="pl-8 self-center">Answers</a>
    <a href="/about" class="pl-8 self-center">About</a>
    <a href="/faq" class="pl-8 self-center">FAQ</a>
  </div>
</nav>

<slot />
