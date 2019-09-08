<script>
  import Transactions from "../components/Transactions.svelte";
  import Instructions from "../components/Instructions.svelte";

  let showInstructions = false;
  const toggleInstructions = () => (showInstructions = !showInstructions);
</script>

<main>
  <div class="flex bg-blue-600 text-white p-5">
    <h1 class="text-3xl">
      <a href="/">Liquid Swap Server</a>
    </h1>
    <div class="text-3xl ml-auto cursor-pointer" on:click={toggleInstructions}>
      ?
    </div>
  </div>

  {#if showInstructions}
    <Instructions {toggleInstructions} />
  {/if}

  <div class="text-xl max-w-md flex-grow mx-auto p-6 text-center">
    <slot />
    <Transactions />
  </div>
</main>
