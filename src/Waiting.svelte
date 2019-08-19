<script>
import { bidTwn, askTwn } from "./tweens";
export let rate;
</script>

<h1 class="text-3xl">Got it!</h1>
<div>We'll broadcast when the price goes above: {parseFloat(rate).toFixed(2)}</div>
<p class="mb-0">Current Price: {$askTwn.toFixed(2)}</p>
