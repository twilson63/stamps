<script>
  import { getAssetCount, getStampCount } from "../lib/app.js";
</script>

<main>
  <section class="hero min-h-screen bg-base-100 items-start">
    <div class="hero-content flex-col">
      <h1 class="text-6xl font-extrabold">STAMPS</h1>
      <div class="stats">
        {#await getAssetCount() then count}
          <div class="stat place-items-center">
            <div class="stat-title">Tradeable Atomic Assets</div>
            <div class="stat-value">{count}</div>
          </div>
        {/await}
        {#await getStampCount() then count}
          <div class="stat place-items-center">
            <div class="stat-title">Total Stamps Created</div>
            <div class="stat-value">{count}</div>
          </div>
        {/await}
      </div>
      <div class="border-2 border-gray-400 rounded-xl p-8">
        <div class="flex flex-col items-center space-y-4 mb-8">
          <h3 class="text-2xl font-bold">Rakis</h3>
          <img
            class="mask mask-circle h-[84px] w-[84px]"
            src="https://arweave.net/fYmFNZbRCbPhBWqmOJLNiJFoLFiFchIBSZNI6jRwWaI"
          />
          <div class="text-sm">vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI</div>
        </div>
        <div class="stats shadow">
          <div class="stat place-items-center">
            <div class="stat-title">Atomic Assets</div>
            <div class="stat-value">10</div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title">StampCoin Balance</div>
            <div class="stat-value">100</div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title">burned AR Balance</div>
            <div class="stat-value">1.20</div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title">AR Balance</div>
            <div class="stat-value">2.52</div>
          </div>
        </div>
      </div>
      <div>
        <button disabled={true} class="btn">Get Your Stats</button>
        <button class="btn">Sell StampCoin</button>
        <button class="btn">Purchase StampCoin</button>
      </div>
    </div>
  </section>
</main>
