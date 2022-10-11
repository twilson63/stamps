<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";

  import { is, not } from "ramda";

  export let open;
  export let balance;
  export let price;
  const dispatch = createEventDispatcher();
  let stamp = 0;

  let stampErrorMsg = "";
  let priceErrorMsg = "";

  function handleSell() {
    if (stamp <= 0) {
      stamp = "";
      stampErrorMsg = "You must sell one or more $STAMPS";
      return;
    }
    if (Number.isNaN(price)) {
      price = "";
      priceErrorMsg = "Price must be a number";
      return;
    }
    open = false;
    dispatch("click", { stampCoinQty: stamp, price });
  }
</script>

<Modal
  bind:open
  bgColor="bg-white"
  border="border-4 border-[#929292]"
  cancel={true}
  on:cancel={() => (open = false)}
>
  <div class="px-[36px] py-[24px] flex flex-col space-y-8">
    <!--
    <img class="h-[55px] w-[55px]" src="assets/wallet.svg" alt="wallet" />
    -->
    <h2 class="text-2xl font-bold text-[#160042]">Sell STAMP Coin</h2>
    <p class="text-xl">Your current $TAMP Balance: {balance}</p>
    <form on:submit|preventDefault={handleSell}>
      <div class="form-control">
        <label class="text-xl  text-[#160042]">I want to sell...</label>
        <div class="relative">
          <input
            id="spend"
            type="number"
            class="input input-bordered w-full"
            bind:value={stamp}
            required
            min="0"
            max={balance}
          />
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <!-- Heroicon name: mini/exclamation-circle -->
            <span class="font-bold">$STAMP</span>
          </div>
        </div>
        {#if stampErrorMsg}
          <label class="text-sm text-error">{stampErrorMsg}</label>
        {/if}
      </div>
      <div class="my-4">
        <div>Current Price: {price} $bAR / $TAMP</div>
      </div>
      <div class="form-control">
        <label class="text-xl  text-[#160042]">Price in $bAR</label>
        <div class="relative">
          <input
            id="spend"
            type="number"
            class="input input-bordered w-full"
            bind:value={price}
            required
            step="0.001"
          />
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <!-- Heroicon name: mini/exclamation-circle -->
            <span class="font-bold">$bAR</span>
          </div>
        </div>
        <label class="text-sm">Price in $BAR for 1 $STAMP</label>
        {#if priceErrorMsg}
          <label class="text-sm text-error">{priceErrorMsg}</label>
        {/if}
      </div>
      <div class="my-4">
        <button
          type="submit"
          class="btn btn-block rounded-none hover:bg-gray-400">Sell</button
        >
      </div>
    </form>
  </div>
</Modal>
