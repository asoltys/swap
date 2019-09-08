<script>
  import { onMount, tick } from "svelte";
  import { goto } from "@sapper/app";
  import Spinner from "../components/Spinner.svelte";
  import Balance from "../components/Balance.svelte";
  import assets from "../assets";
  import { askTwn, bidTwn } from "../tweens";
  import focus from "../focus";
  import setInputFilter from "../input-filter";
  import { input, output, proposal } from "../store";

  const fee = 0.00003;

  let submitted = false;

  $input = assets["bitcoin"];
  $output = assets["tether"];

  let inputField, outputField;

  const swap = () => {
    let temp = $input;
    $input = $output;
    $output = temp;
    calc({ target: { value: $input.value } });
  };

  let initialized;
  let bid, ask;

  onMount(async () => {
    const module = await import("../ws");
    module.default(
      "wss://stream.binance.com:9443/ws/btcusdt@ticker",
      async function(event) {
        let msg = JSON.parse(event.data);
        bid = parseFloat(msg.b);
        ask = parseFloat(msg.a);
        $askTwn = ask;
        $bidTwn = bid;

        if (!initialized) {
          $input.value = "0.00100000";
          $output.value = (($input.value - fee) * msg.a).toFixed(8);

          initialized = true;
          await tick();

          [inputField, outputField].map(f =>
            setInputFilter(f, v => /^\d*\.?\d*$/.test(v))
          );
        }
      }
    );
  });

  async function calc(e) {
    setTimeout(() => {
      let { value: v } = e.target;

      v = parseFloat(v);

      if ($input.name === "Bitcoin") {
        v = (v - fee) * bid;
      } else {
        v = v / ask - fee;
      }

      if (v && !isNaN(v)) $output.value = Math.max(v, 0).toFixed(8);
    });
  }

  const submit = async () => {
    const res = await fetch(
      `/api/proposal?v1=${$output.value}&v2=${$input.value}&a1=${$output.id}&a2=${$input.id}`
    );
    $proposal = await res.json();
    goto("proposing");
  };
</script>

{#if initialized}
  {#if $input.name === 'Bitcoin'}
    <p class="mb-2">Binance Bid: {$bidTwn.toFixed(2)}</p>
  {:else}
    <p class="mb-2">Binance Ask: {$askTwn.toFixed(2)}</p>
  {/if}

  <h2 class="text-3xl">Swap</h2>
  <form on:submit|preventDefault={submit}>
    <div class="flex">
      <input
        type="text"
        bind:this={inputField}
        class="appearance-none w-4 border p-2 flex-grow mr-2 text-right text-2xl"
        bind:value={$input.value}
        use:focus
        on:keyup={calc} />
      <img
        src={`/${$input.logo}`}
        alt={`/${$input.name}`}
        class="w-12 m-auto cursor-pointer"
        on:click={swap} />
    </div>
    <div class="relative">
      <img
        src="/swap.svg"
        alt="Switch"
        class="w-12 absolute right-0 cursor-pointer"
        on:click={swap} />
      <h2 class="text-3xl">for</h2>
    </div>
    <div class="clearfix flex mb-4">
      <input
        type="text"
        bind:this={outputField}
        class="appearance-none w-4 border p-2 flex-grow mr-2 text-right text-2xl"
        bind:value={$output.value} />
      <img
        src={`/${$output.logo}`}
        alt={`/${$output.name}`}
        class="w-12 m-auto cursor-pointer"
        on:click={swap} />
    </div>

    <button
      class="text-3xl w-full"
      on:click={submit}
      disabled={$output.value <= 0 || $input.value <= 0}>
      Go
    </button>
  </form>
{:else}
  <Spinner />
{/if}
