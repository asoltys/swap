<script>
  import Balance from "./Balance.svelte";
  let ask, bid, last;
  var ws = new WebSocket('wss://api-pub.bitfinex.com/ws/2');
  let chanId;

  ws.onmessage = function (event) {
    let msg = JSON.parse(event.data);

    if (msg[1] && msg[1] !== "hb") {
      bid = msg[1][0];
      ask = msg[1][2];
      last = msg[1][6];
      console.log(bid, ask, last);
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
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Liquid Swap Server</h1>
<p>Bid: {bid}</p>
<p>Ask: {ask}</p>
<p>Last: {last}</p>
<Balance />
