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
    buyStampCoin,
    getLatestWinners,
  } from "../lib/app.js";
  import Connect from "../dialogs/connect.svelte";
  import Help from "../dialogs/wallet-help.svelte";
  import Buy from "../dialogs/buy.svelte";
  import Sell from "../dialogs/sell.svelte";
  import { profile, balances } from "../store.js";

  let showConnect = false;
  let showHelp = false;
  let showBuy = false;
  let showSell = false;
  let stampBalance;
  let stampPrice;

  async function handleSell(e) {
    const stampCoinBalance = await sellStampCoin(
      e.detail.stampCoinQty,
      e.detail.price,
      $profile.addr
    );

    $balances.stampcoins = stampCoinBalance;
  }

  async function handleBuy(e) {
    const stampCoinBalance = await buyStampCoin(
      e.detail.stampCoinQty,
      e.detail.price,
      $profile.addr
    );
    $balances.stampcoins = stampCoinBalance;
  }

  async function myStampCoins() {
    stampBalance = await getStampCoinBalance($profile.addr);
    stampPrice = await getCurrentPrice();
    return stampBalance;
  }

  async function getBalances() {
    $balances = { assets: 0, stampcoins: 0, bar: 0, ar: 0 };
    $balances.assets = await getUserAssets($profile.addr);
    $balances.stampcoins = await myStampCoins();
    $balances.bar = await getBARBalance($profile.addr);
    $balances.ar = await getArBalance($profile.addr);
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
                {$balances.assets}
              </div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">StampCoin Balance</div>
              <div class="stat-value">
                {$balances.stampcoins}
              </div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">burned AR Balance</div>
              <div class="stat-value">
                {$balances.bar}
              </div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">AR Balance</div>
              <div class="stat-value">
                {$balances.ar}
              </div>
            </div>
          </div>
        </div>
        <div>
          <button class="btn rounded-none" on:click={() => (showBuy = true)}
            >Buy</button
          >
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
        <div class="h-[100px] grid place-items-center">
          <button
            class="btn btn-primary btn-outline rounded-none"
            on:click={() => (showConnect = true)}>Connect Wallet</button
          >
        </div>
      {/if}
      <div class="flex flex-col">
        <h3 class="text-2xl">Recent Stamp Coin Winners</h3>
        {#await getLatestWinners() then assets}
          {#each assets as asset}
            <div class="card w-[400px] md:w-[800px] shadow-xl">
              <div class="card-body">
                <div class="card-title">{asset.title}</div>
                <div>{asset.description}</div>
                <div class="flex space-x-4">
                  <div class="flex flex-col">
                    <div class="font-bold">Rewards</div>
                    <div>{asset.coins}</div>
                  </div>
                  <div class="flex flex-col">
                    <div class="font-bold">Creator</div>
                    <div>{asset.creator}</div>
                  </div>
                  <div class="flex flex-col">
                    <div class="font-bold">View</div>
                    <div>
                      <a target="_blank" href="https://arweave.net/{asset.id}"
                        >[View]</a
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        {/await}
      </div>
    </div>
  </section>
</main>
<Connect
  bind:open={showConnect}
  on:help={() => (showHelp = true)}
  on:connected={getBalances}
/>
<Help bind:open={showHelp} />
<Buy
  bind:open={showBuy}
  price={stampPrice}
  balance={$balances.stampcoins}
  on:click={handleBuy}
/>
<Sell
  bind:open={showSell}
  on:click={handleSell}
  balance={$balances.stampcoins}
  price={stampPrice}
/>
