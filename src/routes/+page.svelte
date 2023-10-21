<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';
    export let form: ActionData;
    let formLoading = false;
    $: 
</script>

<section class="container">
    <h1>What If...?</h1>
    <form method="POST" use:enhance={() => {
        formLoading = true;
        return async({ update }) => {
            formLoading = false;
            update();
        }
    }}>
        <input name="question" type="question" required placeholder="the moon was made of cheese" />?
        <button>Go!</button>
    </form>
    
    {#if formLoading}
        <p>loading....</p>
    {/if}
    
    {#if form?.success}
        <article>
            <h2>What if {form.question}?</h2>
            {#if form.imageResponse}
                {#each form.imageResponse as image, i}
                    <img src={image.url} alt={`what if machine response #${i}`} />
                {/each}
            {/if}
            <p>{form.textResponse}</p>
            <p>DEBUG: response length = {form?.textResponse?.length}</p>
            <p>DEBUG: word count = {form.textResponse?.split(" ").length}</p>
        </article>
    {/if}

</section>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>