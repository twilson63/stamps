<script>
  import {
    getAssetCount,
    getStampCount,
    getUserAssets,
    getStampCoinBalance,
    getArBalance,
    getBARBalance,
  } from "../lib/app.js";
  import Connect from "../dialogs/connect.svelte";
  import Help from "../dialogs/wallet-help.svelte";
  import { profile } from "../store.js";

  let showConnect = false;
  let showHelp = false;
</script>

<main>
  <section class="hero min-h-screen bg-base-100 items-start">
    <div class="hero-content flex-col">
      <h1 class="text-6xl font-extrabold text-[#231F1F]">STAMPS</h1>
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
                {#await getStampCoinBalance($profile.addr) then count}
                  {count}
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
          <button
            class="btn"
            on:click={async () => {
              await window.arweaveWallet.disconnect();
              $profile = null;
            }}>Disconnect</button
          >
          <!--
          <button class="btn">Sell StampCoin</button>
          <button class="btn">Purchase StampCoin</button>
          -->
        </div>
      {:else}
        <div class="h-[400px] grid place-items-center">
          <button class="btn btn-primary" on:click={() => (showConnect = true)}
            >Connect Wallet</button
          >
        </div>
      {/if}
    </div>
  </section>
</main>
<Connect bind:open={showConnect} on:help={() => (showHelp = true)} />
<Help bind:open={showHelp} />
