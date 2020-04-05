<script>
  import { input } from "../store";
  import { askTwn, bidTwn } from "../tweens";
</script>

{#if $input}
  {#if $input.name === 'Bitcoin'}
    <p class="mb-2">Binance Bid: {$bidTwn.toFixed(2)}</p>
  {:else}
    <p class="mb-2">Binance Ask: {$askTwn.toFixed(2)}</p>
  {/if}
{/if}
