<script lang="ts">
  interface AnswerPageData {
    answerId: number;
    query: string;
    imageData: string;
    content: string;
  }
  export let data: AnswerPageData;
  // async function getImg() {
  //   const res = await fetch(`/api/answer-image/${data.answerId}`);
  //   return await res.json();
  // }
</script>

<article
  class="dark:text-white flex-col justify-center align-middle text-center mt-16 mx-24"
>
  <h1>What if...?</h1>
  <h1 class="text-4xl pb-8">What if {data?.query}?</h1>

  <div class="flex justify-center align-middle">
    <!-- Disabled until obj storage retrieval code is added -->
    <!-- <img
      src={data?.imageData}
      alt={`what if machine response image`}
      class="flex self-center"
    /> -->
  </div>
  <p class="pt-8"><em>{data?.content}</em></p>
</article>
