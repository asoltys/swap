<script>
  import Balance from "./Balance.svelte";
  import Accept from "./Accept.svelte";

  let amount = "";
  let ask, bid, last;
  var ws = new WebSocket('wss://api-pub.bitfinex.com/ws/2');
  let chanId;

  ws.onmessage = function (event) {
    let msg = JSON.parse(event.data);

    if (msg[1] && msg[1] !== "hb") {
      bid = msg[1][0];
      ask = msg[1][2];
      last = msg[1][6];
    }

    if (JSON.parse(event.data).event === "info") {
      let msg = JSON.stringify({
        event: "subscribe",
        channel: "ticker",
        symbol: "tBTCUSD"
      });

      ws.send(msg);
    }
  };

let proposal = Promise.resolve("");
async function getProposal() {
    const v1 = amount / ask;
    const v2 = amount;
    const res = await fetch(`/api/proposal?v1=${v1}&v2=${v2}`);
		const json = await res.json();

		if (res.ok) {
			return json;
		} else {
			throw new Error(json);
		}
	}

const submit = async () => {
  proposal = getProposal();
} 
</script>

<h1>Liquid Swap Server</h1>
<Balance />
<label>Amount L-USDt to purchase</label>
<input bind:value={amount} />
<button on:click={submit}>
	submit
</button>

{#await proposal}
{:then p}
  {#if p.proposal}
  <p>{p.proposal}</p>
  <p>{JSON.stringify(p.info)}</p>
  {/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<Accept />
