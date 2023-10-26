<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";

  import type { ActionData } from "./$types";

  export let form: ActionData;

  let formLoading = false;

  $: if (form?.success && form?.answerId) {
    console.log("success!");
    goto(`http://localhost:5173/answer/${form.answerId}`);
  }
</script>

<section class="flex-col justify-center align-middle mt-24 dark:text-white">
  <article class="flex-col justify-center align-middle">
    <h1 class="text-8xl text-center">What If</h1>
    <p class="text-center m-24 dark:text-slate-400">
      Welcome to the 'What If' Machine! Ask any 'What If' question you can dream
      up, and our AI will generate imaginative answers that'll leave you
      wondering and inspired. Try it out now!
    </p>
  </article>

  <form
    method="POST"
    use:enhance={() => {
      formLoading = true;
      return async ({ update }) => {
        formLoading = false;
        update();
      };
    }}
    class="flex text-center align-middle justify-center"
  >
    <div class="w-1/2 relative">
      <input
        name="question"
        type="question"
        required
        placeholder="what if the moon was made of cheese"
        class="border-2 p-4 rounded-lg w-full bg-slate-300 dark:text-slate-600"
      />
      <button
        class="absolute top-0 right-0 w-16 h-full rounded-r-lg bg-indigo-500 text-white"
        >?</button
      >
    </div>
  </form>

  <!-- An interstitial page will probably need to exist for this purpose -->
  {#if formLoading}
    <section class="flex text-center align-middle justify-center pt-16">
      <p class="flex text-center w-`">loading....</p>
    </section>
  {/if}

  {#if form?.success}
    <!-- Maybe something goes here? -->
    <p>Done!</p>
  {/if}
</section>
