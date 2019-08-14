<script>
  let acceptance = "";
  let info = Promise.resolve("");

  const submit = async () => {
     info = await fetch('/api/acceptance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ acceptance })
    })
    .then(response => response.json());
  } 
</script>

<h1>Accept</h1>
<textarea bind:value={acceptance}></textarea>
<button on:click={submit}>Submit</button>

<p>err</p>
{#await info}
  waiting...
{:then infotxt}
  <pre>{JSON.stringify(infotxt)}</pre>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
