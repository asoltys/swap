<script>
  import Spinner from "./Spinner.svelte";
  import Waiting from "./Waiting.svelte";
  import focus from "./focus";

  let acceptance = "";
  let info = Promise.resolve("");

  async function sendAcceptance() {
    const res = await fetch('/api/acceptance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ acceptance })
    })
		const json = await res.text();
     
		if (res.ok) {
			return json;
		} else {
			throw new Error(json);
		}
  } 

  const submit = () => {
    info = sendAcceptance()   
    state = "accepted";
  } 

  let state = "input";
</script>

{#if state === "input"}
  <textarea use:focus placeholder="Paste the encoded acceptance transaction in all its glory here" class="border p-2 h-64" bind:value={acceptance}></textarea>
  <button class="block bg-blue-600 p-4 text-white mx-auto" on:click={submit}>Submit</button>
{/if}

{#await info}
  <Spinner />
{:then rate}
  {#if rate.length > 0}
    <Waiting rate={rate} />
  {/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
