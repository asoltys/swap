<script>
  import { goto } from "@sapper/app";
  import Spinner from "../components/Spinner.svelte";
  import copy from "../copy";
  import { input, output, proposal } from "../store";

  let show = false;
  let copied = false;

  const toggle = () => {
    copied = false;
    show = !show;
  };

  const download = async () => {
    copied = false;
    const p = await $proposal;
    const filename = "proposal.txt";
    const blob = new Blob([p.proposal], { type: "text/plain;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const accept = () => goto("accepting");
</script>

{#await $proposal}
  <Spinner />
{:then p}
  {#if p.proposal}
    <h1 class="text-3xl">The Proposal</h1>

    <div class="shadow p-2 rounded text-left my-4">
      <div>You send: {parseFloat($input.value).toFixed(8)} {$input.name}</div>
      <div>We send: {parseFloat($output.value).toFixed(8)} {$output.name}</div>
      <div>We add a fee: {p.info.legs[0].fee} Bitcoin</div>
    </div>

    <div class="text-left mb-2">
      {#if p.asset === 'tether'}
        We'll finalize and broadcast the tx when the bid price is above {parseFloat(1 / p.rate).toFixed(2)}
      {:else}
        We'll finalize and broadcast the tx when the ask price is below {parseFloat(p.rate).toFixed(2)}
      {/if}
    </div>

    <div>
      <button on:click={toggle}>{show ? 'Hide' : 'Show'}</button>
      <button on:click={() => copy(p.proposal)}>Copy</button>
      <button on:click={download}>Download</button>
    </div>

    <button class="my-4" on:click={accept}>Submit Accepted Transaction</button>

    {#if copied}
      <div>Copied to clipboard!</div>
    {/if}

    {#if show}
      <pre
        class="border bg-gray-100 break-all whitespace-normal text-left mt-4
        text-xs p-4">
        {p.proposal.replace(/\n*|\s*/g, '')}
      </pre>
    {/if}
  {/if}
{:catch error}
  <p style="color: red">{error}</p>
  <button class="my-4" on:click={() => goto('')}>Back</button>
{/await}
