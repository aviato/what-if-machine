<script lang="ts">
  interface AnswerPageData {
    id: string;
    query: string;
    content: string;
  }
  export let data: AnswerPageData;
</script>

<article
  class="dark:text-white flex-col justify-center align-middle text-center mt-16 mx-24"
>
  <h1 class="text-4xl pb-16">What if...</h1>
  <h2 class="text-8xl pb-8">{data?.query}?</h2>

  <div class="flex justify-center align-middle">
    <img
      src={`${process.env.CF_WORKER_URL}${data?.id}`}
      alt={`what if machine response image`}
      class="flex self-center"
    />
  </div>
  <p class="pt-8"><em>{data?.content}</em></p>
</article>
