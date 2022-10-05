<script>
  import {
    getAssetCount,
    getStampCount,
    getUserAssets,
    getStampCoinBalance,
    getArBalance,
    getBARBalance,
    sellStampCoin,
    getCurrentPrice,
  } from "../lib/app.js";
  import Connect from "../dialogs/connect.svelte";
  import Help from "../dialogs/wallet-help.svelte";
  import Buy from "../dialogs/buy.svelte";
  import Sell from "../dialogs/sell.svelte";
  import { profile } from "../store.js";

  let showConnect = false;
  let showHelp = false;
  let showBuy = false;
  let showSell = false;
  let stampBalance;
  let stampPrice;

  async function handleSell(e) {
    const success = await sellStampCoin(e.detail.stampCoinQty, $profile.addr);
    if (success) {
      alert("Success");
    } else {
      alert("Error");
    }
  }

  async function myStampCoins() {
    stampBalance = await getStampCoinBalance($profile.addr);
    stampPrice = await getCurrentPrice();
    return stampBalance;
  }
</script>

<main>
  <section class="hero min-h-screen bg-base-100 items-start">
    <div class="hero-content flex-col">
      <h1 class="text-4xl font-bold text-[#231F1F]">STAMPS</h1>
      <div class="stats">
        {#await getAssetCount() then count}
          <div class="stat place-items-center">
            <div class="stat-title">Tradeable Atomic Assets</div>
            <div class="stat-value text-[#231F1F]">{count}</div>
          </div>
        {/await}
        {#await getStampCount() then count}
          <div class="stat place-items-center">
            <div class="stat-title">Total Stamps Created</div>
            <div class="stat-value text-[#231F1F]">{count}</div>
          </div>
        {/await}
      </div>
      {#if $profile}
        <div class="border-2 border-gray-400 rounded-xl p-8">
          <div class="flex flex-col items-center space-y-4 mb-8">
            <h3 class="text-2xl font-bold">
              {$profile.profile.handleName !== ""
                ? $profile.profile.handleName
                : $profile.handle}
            </h3>
            <img
              class="mask mask-circle h-[84px] w-[84px]"
              src={$profile.profile.avatarURL}
              alt={$profile.handle}
            />
            <div class="text-sm">
              {$profile.addr}
            </div>
          </div>
          <div class="stats shadow">
            <div class="stat place-items-center">
              <div class="stat-title">Atomic Assets</div>
              <div class="stat-value">
                {#await getUserAssets($profile.addr) then count}
                  {count}
                {/await}
              </div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">StampCoin Balance</div>
              <div class="stat-value">
                {#await myStampCoins() then amount}
                  {amount}
                {/await}
              </div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">burned AR Balance</div>
              <div class="stat-value">
                {#await getBARBalance($profile.addr) then count}
                  {count}
                {/await}
              </div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">AR Balance</div>
              <div class="stat-value">
                {#await getArBalance($profile.addr) then count}
                  {count}
                {/await}
              </div>
            </div>
          </div>
        </div>
        <div>
          <button class="btn rounded-none" on:click={() => (showSell = true)}
            >Sell</button
          >
          <button
            class="btn rounded-none  btn-outline"
            on:click={async () => {
              await window.arweaveWallet.disconnect();
              $profile = null;
            }}>Disconnect</button
          >

          <!--
          <button class="btn">Purchase StampCoin</button>
          -->
        </div>
      {:else}
        <div class="h-[400px] grid place-items-center">
          <button
            class="btn btn-primary btn-outline rounded-none"
            on:click={() => (showConnect = true)}>Connect Wallet</button
          >
        </div>
      {/if}
    </div>
  </section>
</main>
<Connect bind:open={showConnect} on:help={() => (showHelp = true)} />
<Help bind:open={showHelp} />
<Buy bind:open={showBuy} />
<Sell
  bind:open={showSell}
  on:click={handleSell}
  balance={stampBalance}
  price={stampPrice}
/>
