<script>
  import { tick } from 'svelte';
  import Spinner from "./Spinner.svelte";
  import Accept from "./Accept.svelte";
  import Balance from "./Balance.svelte";
  import assets from "./assets";
  import { askTwn, bidTwn } from "./tweens";
  import focus from "./focus";

	export let name;
  const fee = 0.00002855;

  let showInstructions = false;
  const dismiss = () => showInstructions = false;
  let submitted = false;

  let input = assets["bitcoin"];
  let output = assets["tether"];

  let inputField, outputField;

  // Restricts input for the given textbox to the given inputFilter.
  function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
      textbox.addEventListener(event, function() {
        if (inputFilter(this.value)) {
          this.oldValue = this.value;
          this.oldSelectionStart = this.selectionStart;
          this.oldSelectionEnd = this.selectionEnd;
        } else if (this.hasOwnProperty("oldValue")) {
          this.value = this.oldValue;
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        }
      });
    });
  }

  // Restrict input to digits and '.' by using a regular expression filter.

  const swap = () => {
    let temp = input;
    input = output;
    output = temp;
    calc({ target: { value: input.value }});
  } 

  let copied = false;
  const copy = str => {
    copied = false;
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const selected =
      document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
    
    copied = true;
  };

  const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

  let initialized;
  let bid, ask;
  ws.onmessage = async function (event) {
    let msg = JSON.parse(event.data);
    bid = parseFloat(msg.b);
    ask = parseFloat(msg.a);
    askTwn.set(ask);
    bidTwn.set(bid);

    if (!initialized) {
      input.value = "0.00100000"
      output.value = ((input.value - fee) * msg.a).toFixed(8)
      initialized = true;
      await tick();

      [inputField, outputField].map(f =>
        setInputFilter(f, function(value) {
          return /^\d*\.?\d*$/.test(value);
        })
      );
    }
  };

  async function calc(e) {
    let { value: v } = e.target;
    console.log(e.target.value);

    setTimeout(() => {
      v = parseFloat(v);
      console.log(e.target.value);

      if (input.name === "Bitcoin") {
        v = ((v - fee) * bid).toFixed(8)
      }
      else {
        v = ((v / ask) + fee).toFixed(8);
        console.log(v, ask, fee);
      }

      if (v && !isNaN(v)) output.value = v;
    });
  }

  let proposal = Promise.resolve("");
  async function getProposal() {
    const res = await fetch(`/api/proposal?v1=${output.value}&v2=${input.value}&a1=${output.id}&a2=${input.id}`);
    const json = await res.json();

    if (res.ok) {
      return json;
    } else {
      throw new Error(json);
    }
  }

  let state = "home";
  const submit = async () => {
    state = "proposing";
    proposal = getProposal();
  } 

  let show = false
  const toggle = () => {
    copied = false;
    show = !show;
  } 

  const download = async () => {
    copied = false;
    const p = await proposal;
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
  } 

  const accept = () => state = "accepting";
</script>

<style>
  p { @apply mb-4; } 
  p.mb-0 { @apply mb-0; }
</style>

<div class="flex bg-blue-600 text-white p-5">
  <h1 class="text-3xl"><a href="/">Liquid Swap Server</a></h1>
  <div class="text-3xl ml-auto cursor-pointer" on:click={() => showInstructions = !showInstructions}>?</div>
</div>

{#if showInstructions}
<div class="p-4 max-w-xl border-b mx-auto">
  <p>Use this page to request atomic swaps between Bitcoin (L-BTC) and Tether (L-USDt) on the Liquid network. Submit the amount you want to swap and the server will generate a proposal transaction. Use the <a class="text-blue-600" href="https://github.com/Blockstream/liquid-swap">liquid-swap tool</a> to accept the proposal, then submit the encoded acceptance message using the form provided.</p>

  <p>If the exchange rate is in our favour, we'll immediately finalize and broadcast the transaction. Otherwise, the transaction will be queued until the exchange rate comes back our way.</p>

  <p>We use the bid and ask rates from Binance and don't charge any additional commission.</p>

  <Balance />

  <div class="w-100 text-right">
    <button class="bg-blue-600 p-4 text-white" on:click={dismiss}>Got it</button>
  </div>
</div>
{/if}

<div class="text-xl max-w-md flex-grow mx-auto p-6 text-center">
  {#if state == "accepting"}
    {#if input.name === "Bitcoin"}
      <p class="mb-2">Binance Bid: {$bidTwn.toFixed(2)}</p>
    {:else}
      <p class="mb-2">Binance Ask: {$askTwn.toFixed(2)}</p>
    {/if}
    <Accept />
  {/if}
  {#if state == "proposing"}
    {#await proposal}
      <Spinner />
    {:then p}
      {#if p.proposal}
        <h1 class="text-3xl">The Proposal</h1>

        <div class="shadow p-2 rounded text-left my-4">
          <div>
            You send: {parseFloat(input.value).toFixed(8)} {input.name}
          </div>
          <div>
            We send: {parseFloat(output.value).toFixed(8)} {output.name}
          </div>
          <div>
            We add a fee: {p.info.legs[0].fee} Bitcoin
          </div>
        </div>

        <div class="text-left mb-2">
          {#if p.asset === "tether"}
            We'll broadcast when the bid price is above {parseFloat(p.rate).toFixed(2)}
          {:else}
            We'll broadcast when the ask price is below {parseFloat(p.rate).toFixed(2)}
          {/if}
        </div>

        <div>
          <button class="bg-blue-600 p-4 text-white" on:click={toggle}>{show ? "Hide" : "Show"}</button>
          <button class="bg-blue-600 p-4 text-white" on:click={() => copy(p.proposal)}>Copy</button>
          <button class="bg-blue-600 p-4 text-white" on:click={download}>Download</button>
        </div>

        <button class="bg-blue-600 p-4 text-white my-4" on:click={accept}>Submit Accepted Transaction</button>

        {#if copied}
          <div>Copied to clipboard!</div>
        {/if}

        {#if show}
          <pre class="border bg-gray-100 break-all whitespace-normal text-left mt-4 text-xs p-4">
            {p.proposal.replace(/\n*|\s*/g, "")}
          </pre>
        {/if}
      {/if}
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {/if}

  {#if state == "home"}
    {#if initialized}
      {#if input.name === "Bitcoin"}
        <p class="mb-2">Binance Bid: {$bidTwn.toFixed(2)}</p>
      {:else}
        <p class="mb-2">Binance Ask: {$askTwn.toFixed(2)}</p>
      {/if}

      <h2 class="text-3xl">Swap</h2>
      <form on:submit|preventDefault={submit}>
        <div class="flex">
          <input type="text" bind:this={inputField} class="appearance-none w-4 border p-2 flex-grow mr-2 text-right text-2xl" bind:value={input.value} use:focus on:keydown={calc} />
          <img src={`/${input.logo}`} alt={`/${input.name}`} class="w-12 m-auto cursor-pointer" on:click={swap} />
        </div>
        <div class="relative">
          <img src="/swap.svg" alt="Switch" class="w-12 absolute right-0 cursor-pointer" on:click={swap} />
          <h2 class="text-3xl">for</h2>
        </div>
        <div class="clearfix flex mb-4">
          <input type="text" bind:this={outputField} class="appearance-none w-4 border p-2 flex-grow mr-2 text-right text-2xl" bind:value={output.value} />
          <img  src={`/${output.logo}`} alt={`/${output.name}`} class="w-12 m-auto cursor-pointer" on:click={swap} />
        </div>

        <button class="bg-blue-600 p-2 text-3xl text-white w-24" on:click={submit}>Go</button>
      </form>
    {:else}
      <Spinner />
    {/if}
  {/if}
</div>
