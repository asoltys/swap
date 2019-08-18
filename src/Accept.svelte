<script>
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
  } 
</script>

<textarea placeholder="Paste the encoded acceptance transaction in all its glory here" class="border p-2 h-64" bind:value={acceptance}></textarea>
<button class="block bg-blue-600 p-4 text-white mx-auto" on:click={submit}>Submit</button>

{#await info}
  Parsing Transaction
{:then json}
  {#if json.length > 0}
    <pre>{JSON.stringify(json)}</pre>
  {/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
