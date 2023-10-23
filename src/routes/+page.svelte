<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  export let form: ActionData;
  let formLoading = false;
</script>

<section class="flex-col justify-center align-middle mt-24">
  <article class="flex-col justify-center align-middle">
    <h1 class="text-8xl text-center">What If</h1>
    <p class="text-center m-24">
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
        class="border-2 p-4 rounded-lg w-full"
      />
      <button
        class="absolute top-0 right-0 w-16 h-full rounded-r-lg bg-indigo-500 text-white"
        >?</button
      >
    </div>
  </form>

  {#if formLoading}
    <section class="flex text-center align-middle justify-center pt-16">
      <p class="flex text-center w-`">loading....</p>
    </section>
  {/if}

  {#if form?.success}
    <article
      class="flex-col justify-center align-middle text-center mt-16 mx-24"
    >
      <h1 class="text-4xl pb-8">What if {form.question}?</h1>
      {#if form.imageResponse}
        {#each form.imageResponse as image, i}
          <div class="flex justify-center align-middle">
            <img
              src={image.url}
              alt={`what if machine response #${i}`}
              class="flex self-center"
            />
          </div>
        {/each}
      {/if}
      <p class="pt-8"><em>{form.textResponse}</em></p>
    </article>
  {/if}
</section>

<style>
  /* input[type="question"]::placeholder {
    text-align: center;
  } */
</style>
