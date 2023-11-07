<script lang="ts">
  import type { AnswerPageData } from "./+page.server";
  export let data: AnswerPageData;
</script>

<article class="text-white flex-col justify-center my-24 md:mx-auto max-w-3xl">
  <header class="flex-col mx-10">
    <h1 class="text-3xl leading-9 font-normal">{data?.query}?</h1>

    <h2 class="text-extralight leading-4 mt-4 mb-8 text-gray-400">
      <em
        >by <strong class="font-normal text-gray-300"
          >{data?.author || "whatifmachine.ai"}</strong
        ></em
      >
    </h2>
  </header>
  <div class="flex-col md:mx-10">
    <img
      src={data?.imageUrl}
      alt={`what if machine response image`}
      class="flex w-full h-auto md:h-1/2 lg:px object-cover"
    />
    {#if data?.caption}
      <p
        class="text-right mt-4 mr-8 text-lg leading-6 font-light text-gray-400"
      >
        {data?.caption}
      </p>
    {/if}
  </div>
  <p id="answer-content" class="pt-8 mx-10 mt-8 text-normal">
    <break />
    {data?.content}
  </p>
</article>

<!-- TODO: Reference CSS vars here instead of hardcoded values -->
<style>
  #answer-content:first-letter {
    color: #fff;
    float: left;
    font-size: 72px;
    line-height: 88px;
    padding: 8px;
    border: 1px solid white;
    margin-right: 8px;
  }

  #answer-content:first-letter::before {
    content: "------";
  }
</style>
