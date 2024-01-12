<script lang="ts">
  import type { AnswersPageData } from "./+page.server";
  export let data: AnswersPageData;

  function formatDateToMMDDYYHHMMSS(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    };

    return date.toLocaleString("en-US", options);
  }
</script>

<section
  class="flex flex-col dark:text-white px-8 md:mx-auto max-w-3xl my-12 h-full w-full"
>
  <h1 class="flex flex-col text-4xl leading-9 mb-8">Archived Answers</h1>
  <ol class="flex flex-col">
    {#each data.answers as answer}
      <a href={`/answer/${answer.id}`} class="flex justify-between">
        <li class="flex flex-row justify-between w-full">
          <div class="truncate w-3/4">{answer.query}</div>
          <div>{formatDateToMMDDYYHHMMSS(new Date(answer.created_at))}</div>
        </li>
      </a>
    {/each}
  </ol>
</section>
