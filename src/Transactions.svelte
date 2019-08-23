<script>
  import timeago from "timeago.js";

  let bitcoin = [];
  let tether = [];
  let completed = [];

  const api = new WebSocket("ws://swap/ws");

  api.onmessage = async function(event) {
    console.log(event.data);
    ({ bitcoin, tether, completed } = JSON.parse(event.data));
  };
</script>

<div class
<div class="flex">
  <div class="w-1/2">
    <h2>Bitcoin</h2>
    {#each bitcoin as tx (tx.key)}
      <div>{timeago.format(tx.key)}</div>
    {/each}
  </div>

  <div class="w-1/2">
    <h2>Tether</h2>
    {#each tether as tx (tx.key)}
      <div>{timeago.format(tx.key)}</div>
    {/each}
  </div>
</div>

<h2>Completed</h2>
{#each completed as tx (tx.key)}
  <div>
    {timeago.format(tx.key)}
    <a href="https://blockstream.info/liquid/tx/{tx.id}">{tx.id}</a>
  </div>
{/each}
