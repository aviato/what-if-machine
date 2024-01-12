<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { ActionData } from "./$types";

  export let form: ActionData;

  let formLoading = false;

  $: if (form?.success && form?.answerId) {
    goto(`/answer/${form?.answerId}`);
  }

  let inputValue = "";
  let charCount = 0;

  function updateCharCount() {
    charCount = inputValue.length;
  }

  $: isInputValid = charCount <= 50;
</script>

<section class="flex flex-col justify-center md:mx-auto max-w-3xl h-full w-full">
  {#if !formLoading}
    <article class="flex flex-col justify-center">
      <header class="flex flex-col self-center mt-12">
        <h6 class="text-2xl leading-none font-extralight text-left">THE</h6>
        <h1
          class="text-7xl leading-none font-light text-center uppercase text-emerald-700"
        >
          What If
        </h1>
        <h4 class="text-4xl leading-tight font-extralight text-right">
          MACHINE
        </h4>
      </header>
    </article>

    <form
      method="POST"
      use:enhance={() => {
        formLoading = true;
        return async ({ update }) => {
          await update();
          formLoading = false;
        };
      }}
      class="flex flex-col mt-24 mx-8"
    >
      <p class={`${isInputValid ? "text-slate-500" : "text-red-600"} mb-4`}>
        Character count: {charCount}/50
      </p>
      <div class="w-full relative">
        <input
          name="question"
          type="question"
          required
          placeholder="what if the moon was made of cheese"
          class="p-4 w-full bg-slate-300 text-slate-600"
          bind:value={inputValue}
          on:input={updateCharCount}
        />
        <button
          aria-disabled={!isInputValid}
          disabled={!isInputValid}
          type="submit"
          class="absolute top-0 right-0 w-16 h-full {isInputValid
            ? 'bg-emerald-700 text-white'
            : 'bg-slate-600 text-slate-200'}">{isInputValid ? "?" : "-"}</button
        >
      </div>
    </form>
    {#if form?.warning}
      <section class="text-red-500 pt-4 mx-8">
        <h4>
          Your query was flagged for a policy violation by Open AI's content
          moderation.
        </h4>
        <p>
          You have {form?.warningCount || 0} warnings. On your third strike your
          access will be revoked. You can read more about the content policy
          <a href="https://openai.com/policies/usage-policies" class="underline"
            >here</a
          >.
        </p>
      </section>
    {/if}
  {:else}
    <section class="flex flex-col text-center pt-16">
      <div role="status">
        <svg
          aria-hidden="true"
          class="inline w-16 h-16 mr-2 text-gray-200 animate-spin text-gray-600 fill-blue-600 mb-4"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
      <h2 class="mb-2 text-3xl font-semibold text-white">
        Generating Answer...
      </h2>
      <h3 class="text-lg font-light">
        This process could take up to 2 minutes. If it takes any longer please
        referesh your page and try again.
      </h3>
    </section>
  {/if}
</section>
