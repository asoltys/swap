<script>
  import Proposal from "./Proposal.svelte";
  import assets from "./assets";
	export let name;
  let showInstructions = false;
  const dismiss = () => showInstructions = false;
  const submit= () => showInstructions = false;

  let input = assets["tether"];
  let output = assets["bitcoin"];

  const swap = () => {
    let temp = input;
    input = output;
    output = temp;
  } 
</script>

<div class="flex bg-blue-600 text-white p-5">
  <h1 class="text-3xl"><a href="/">Liquid Swap Server</a></h1>
  <div class="text-3xl ml-auto cursor-pointer" on:click={() => showInstructions = !showInstructions}>?</div>
</div>

{#if showInstructions}
<div class="p-4 max-w-xl border-b mx-auto">
  <p class="mb-2">Use this page to request atomic swaps between Bitcoin (BTC) and Tether (USDt) on the Liquid network. Submit the amount you want to swap and the server will generate a proposal transaction. Use the <a class="text-blue-600" href="https://github.com/Blockstream/liquid-swap">liquid-swap tool</a> to accept the proposal, then submit the resulting encoded message with the accepted transaction using the form below.</p>

  <p class="mb-2">If the exchange rate has not fluctuated out of our favour, we'll immediately finalize and broadcast the transaction. Otherwise, the transaction will be queued until the exchange rate comes back our way.</p>

  <p>We use the bid and ask rates from Bitfinex minus a flat fee of <code class="bg-gray-200">0.00002 BTC</code> to cover the transaction fee.</p>

  <div class="w-100 text-right">
    <button class="bg-blue-600 p-4 text-white" on:click={dismiss}>Got it</button>
  </div>
</div>
{/if}


<div class="text-xl max-w-md flex-grow mx-auto p-6 text-center">
  <h2 class="text-3xl">Swap</h2>
  <div class="flex">
    <input type="number" step="any" class="border p-2 flex-grow mr-2 text-right text-2xl" bind:value={input.value} />
    <img src={`/${input.logo}`} alt={`/${input.alt}`} class="w-12 m-auto cursor-pointer" on:click={swap} />
  </div>
  <div class="relative">
    <img src="/swap.svg" alt="Switch" class="w-12 absolute right-0 cursor-pointer" on:click={swap} />
    <h2 class="text-3xl">for</h2>
  </div>
  <div class="clearfix flex mb-4">
    <input type="number" step="any" class="border p-2 flex-grow mr-2 text-right text-2xl" bind:value={output.value} />
    <img  src={`/${output.logo}`} alt={`/${output.alt}`} class="w-12 m-auto cursor-pointer" on:click={swap} />
  </div>

  <button class="bg-blue-400 p-2 text-3xl text-white w-24" on:click={submit}>Go</button>
</div>

<div class="bg-blue-700 p-4 min-h-screen text-white">
  <h1 class="text-2xl">Proposals</h1>
    <table>
    <thead>
    <tr>
      <th>Buy</th>
      <th>Sell</th>
      <th>Rate</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>0.1344 BTC</td>
      <td>0.1344 USDt</td>
      <td>$10194.14</td>
    </tr>
    </tbody>
    </table>
</div>

<Proposal />
