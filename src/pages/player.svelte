<script>
  import { onMount } from "svelte";
  import {
    getAccount,
    getUserAssets,
    getStampCoinBalance,
    getBARBalance,
    getArBalance,
  } from "../lib/app.js";
  import Stamps from "../widgets/stamps/Widget.svelte";
  export let addr = "h7wP8NjoGkJTdLXC6kwS6fLTNgfeYbZr9YoED5NFQX0";

  let profile = null;
  let balances = { assets: 0, stampcoins: 0, bar: 0, ar: 0 };

  onMount(async () => {
    profile = await getAccount(addr);
    balances.assets = await getUserAssets(profile.addr);
    balances.stampcoins = await getStampCoinBalance(profile.addr);
    balances.bar = await getBARBalance(profile.addr);
    balances.ar = await getArBalance(profile.addr);
  });

  async function getBalances() {}
</script>

<main class="hero min-h-screen items-start">
  <section class="hero-content flex-col">
    <h1 class="text-4xl">Stamp Player Stats</h1>
    <div class="flex items-center justify-center">
      <a class="btn btn-outline rounded-none" href="/">Leaderboard</a>
    </div>
    {#if profile}
      <div class="border-2 border-gray-400 rounded-xl p-8">
        <div class="flex flex-col items-center space-y-4 mb-8">
          <h3 class="text-2xl font-bold">
            {profile.profile.handleName !== ""
              ? profile.profile.handleName
              : profile.handle}
          </h3>
          <img
            class="mask mask-circle h-[84px] w-[84px]"
            src={profile.profile.avatarURL}
            alt={profile.handle}
          />
          <div class="text-sm">
            {addr}
          </div>
        </div>
        <div class="stats shadow">
          <div class="stat place-items-center">
            <div class="stat-title">Atomic Assets</div>
            <div class="stat-value">
              {balances.assets}
            </div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title">StampCoin Balance</div>
            <div class="stat-value">
              {balances.stampcoins}
            </div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title">burned AR Balance</div>
            <div class="stat-value">
              {balances.bar}
            </div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title">AR Balance</div>
            <div class="stat-value">
              {balances.ar}
            </div>
          </div>
        </div>
      </div>
    {/if}
    <h3 class="text-2xl">Stamped Assets</h3>
    <Stamps address={addr} />
  </section>
</main>
