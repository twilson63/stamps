<script>
  import { onMount } from "svelte";
  import { getRewardHistory } from "../lib/app.js";
  import { reduce } from "ramda";

  export let asset = "mHzKIIfyr4FgbMSOys3VHpsDDs5bSNQVBME-1_ZaIdE";
  let history = null;

  onMount(async () => {
    history = await getRewardHistory(asset);
  });

  function getTotal() {
    return reduce((a, hx) => Number(hx.coins) + a, 0, history).toFixed(4);
  }
</script>

<main class="hero min-h-screen items-start">
  <section class="hero-content flex-col">
    <h1 class="text-4xl">Reward Log</h1>
    <p class="text-xl">This log shows the reward history of an asset.</p>
    <div class="form-control">
      <div class="flex space-x-2">
        <input class="input input-bordered w-[400px]" bind:value={asset} />
        <a class="btn" href="/rewards/{asset}">View History</a>
      </div>
    </div>

    {#if history}
      {#each history as hx}
        <div class="card w-96">
          <div class="card-body">
            <div class="card-title">{hx.date}</div>
            <p>$STAMP: {Number(hx.coins).toFixed(4)}</p>
          </div>
        </div>
      {/each}
      <hr />

      <div class="card  w-96">
        <div class="card-body">
          <div class="card-title">Total</div>
          <p>$STAMP: {getTotal()}</p>
        </div>
      </div>
    {/if}
  </section>
</main>
