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
    getAccount,
    getVouchUsers,
    getOpenOrders,
  } from "../lib/app.js";
  import Order from "../components/order.svelte";
  import Connect from "../dialogs/connect.svelte";
  import Help from "../dialogs/wallet-help.svelte";
  import Buy from "../dialogs/buy.svelte";
  import Sell from "../dialogs/sell.svelte";
  import ConfirmSell from "../dialogs/confirm-sell.svelte";
  import ErrorDialog from "../dialogs/error.svelte";
  import ConfirmBuy from "../dialogs/confirm-buy.svelte";
  import { profile, balances } from "../store.js";
  import { take, takeLast } from "ramda";

  let showConnect = false;
  let showHelp = false;
  let showBuy = false;
  let showSell = false;
  let showConfirmSell = false;
  let showConfirmBuy = false;
  let showErrorDialog = false;
  let errorMessage = "Something went wrong";
  let stampBalance;
  let stampPrice;

  async function handleSell(e) {
    try {
      if (Number($balances.stampcoins) < Number(e.detail.stampCoinQty)) {
        throw new Error("You do not have enough STAMP COIN rewards to sell");
      }
      if (Number(e.detail.price) <= 0) {
        throw new Error("Price must be greater than zero!");
      }

      const stampCoinBalance = await sellStampCoin(
        e.detail.stampCoinQty,
        e.detail.price,
        $profile.addr
      );

      $balances.stampcoins = stampCoinBalance;
      openOrders = await getOpenOrders($profile.addr);
      showConfirmSell = true;
    } catch (e) {
      errorMessage = e.message;
      showErrorDialog = true;
      console.log(e);
    }
  }

  async function handleBuy(e) {
    try {
      const stampCoinBalance = await buyStampCoin(
        e.detail.stampCoinQty,
        e.detail.price,
        $profile.addr
      );

      $balances.bar = await getBARBalance($profile.addr);
      $balances.stampcoins = await myStampCoins();
      showConfirmBuy = true;
    } catch (e) {
      errorMessage = e.message;
      showErrorDialog = true;
      console.log(e);
    }
  }

  async function myStampCoins() {
    stampBalance = await getStampCoinBalance($profile.addr);
    stampPrice = await getCurrentPrice();
    console.log("stampPrice", stampPrice);
    return stampBalance;
  }

  async function getBalances() {
    $balances = { assets: -1, stampcoins: -1, bar: -1, ar: -1 };
    $balances.assets = await getUserAssets($profile.addr);
    $balances.stampcoins = await myStampCoins();
    $balances.bar = await getBARBalance($profile.addr);
    $balances.ar = await getArBalance($profile.addr);
  }

  async function handleCancelOrder() {
    openOrders = await getOpenOrders($profile.addr);
  }
</script>

<main>
  <section class="hero min-h-screen bg-base-100 items-start">
    <div class="hero-content flex-col">
      <h1 class="text-4xl font-bold text-[#231F1F] dark:invert">STAMPS</h1>
      <div class="stats">
        {#await getAssetCount() then count}
          <div class="stat place-items-center">
            <div class="stat-title">Tradeable Atomic Assets</div>
            <div class="stat-value text-[#231F1F] dark:invert">{count}</div>
          </div>
        {/await}
        {#await getStampCount()}
          <div class="stat place-items-center">
            <div class="stat-title">Total Stamps Created</div>
            <div class="stat-value text-[#231F1F] dark:invert">
              <button class="btn btn-ghost loading">&nbsp;&nbsp;</button>
            </div>
          </div>
        {:then count}
          <div class="stat place-items-center">
            <div class="stat-title">Total Stamps Created</div>
            <div class="stat-value text-[#231F1F] dark:invert">{count}</div>
          </div>
        {/await}

        {#await getVouchUsers() then count}
          <div class="stat place-items-center">
            <div class="stat-title">Total Vouched Users</div>
            <div class="stat-value text-[#231F1F] dark:invert">{count}</div>
          </div>
        {/await}
      </div>
      {#if $profile}
        <div class="border-2 border-gray-400 rounded-xl p-8 relative">
          <div class="absolute top-2 right-2">
            <button class="btn" on:click={getBalances}>Refresh</button>
          </div>
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
                {#if $balances.assets > -1}
                  {$balances.assets}
                {:else}
                  <button class="btn btn-ghost loading">&nbsp;&nbsp;</button>
                {/if}
              </div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">StampCoin Balance</div>
              <div class="stat-value">
                {#if $balances.stampcoins > -1}
                  {$balances.stampcoins}
                {:else}
                  <button class="btn btn-ghost loading">&nbsp;&nbsp;</button>
                {/if}
              </div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">burned AR Balance</div>
              <div class="stat-value">
                {#if $balances.bar > -1}
                  {$balances.bar}
                {:else}
                  <button class="btn btn-ghost loading">&nbsp;&nbsp;</button>
                {/if}
              </div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">AR Balance</div>
              <div class="stat-value">
                {#if $balances.ar > -1}
                  {$balances.ar}
                {:else}
                  <button class="btn btn-ghost loading">&nbsp;&nbsp;</button>
                {/if}
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
            <button class="btn" on:click={() => getCurrentPrice()}
            >Get Current Price</button
          >
          <button class="btn">Purchase StampCoin</button>
          -->
        </div>
        <!-- Get Open Orders -->
        {#await getOpenOrders($profile.addr) then orders}
          <h2>My Open Orders</h2>
          {#each orders as order}
            <Order {order} on:cancel-order={handleCancelOrder} />
          {/each}
        {/await}
        <!-- Get Stamps -->
      {:else}
        <div class="h-[100px] grid place-items-center">
          <button
            class="btn btn-primary btn-outline rounded-none"
            on:click={() => (showConnect = true)}>Connect Wallet</button
          >
        </div>
      {/if}
      {#if !$profile}
        <div class="flex flex-col">
          <h3 class="text-2xl">Recent Stamp Coin Winners</h3>
          {#await getLatestWinners() then assets}
            {#each assets as asset}
              {#await getAccount(asset.creator) then acct}
                <div class="card w-[400px] md:w-[800px] shadow-xl">
                  <div class="flex space-x-4 items-center">
                    <img
                      src={acct.profile.avatarURL}
                      class="m-4 mask mask-circle h-[128px] w-[128px]"
                      alt={acct.profile.handle}
                    />

                    <div class="card-body">
                      <div class="card-title">{asset.title}</div>
                      <div>{asset.description}</div>
                      <div class="flex space-x-4">
                        <div class="flex flex-col">
                          <div class="font-bold">Rewards</div>
                          <div>{asset.coins}</div>
                        </div>
                        <div class="flex-1 flex flex-col">
                          <div class="font-bold">Creator</div>
                          <div>
                            {acct.profile.handleName}
                            <a
                              href="https://v2.viewblock.io/arweave/address/{asset.creator}"
                            >
                              {`${take(5, asset.creator)}...${takeLast(
                                5,
                                asset.creator
                              )}`}
                            </a>
                          </div>
                        </div>
                        <div class="flex flex-col">
                          <div class="font-bold">View</div>
                          <div>
                            <a
                              target="_blank"
                              href="https://arweave.net/{asset.id}"
                              ><img
                                src="assets/view.svg"
                                class="h-[24px] w-[24px] dark:invert"
                                alt="view asset"
                              /></a
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              {/await}
            {/each}
          {/await}
        </div>
      {/if}
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
  balance={$balances.bar}
  on:click={handleBuy}
/>
<Sell
  bind:open={showSell}
  on:click={handleSell}
  balance={$balances.stampcoins}
  price={stampPrice}
/>
<ConfirmSell bind:open={showConfirmSell} />
<ErrorDialog bind:open={showErrorDialog} bind:msg={errorMessage} />
<ConfirmBuy bind:open={showConfirmBuy} />
