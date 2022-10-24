<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";

  export let open;
  export let price = 0;
  export let balance = 0;

  const dispatch = createEventDispatcher();
  let qty = 0;
  $: bar = qty * price;

  function handleBuy() {
    if (bar > balance) {
      alert("You dont have enough $BAR to purchase $STAMP");
      return;
    }
    open = false;
    dispatch("click", { stampCoinQty: qty, price });
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
    <h2 class="text-2xl font-bold text-[#160042]">Purchase $STAMP with $bAR</h2>
    <p class="my-4">
      Your current $bAR balance: {balance}
    </p>
    <form on:submit|preventDefault={handleBuy}>
      <div class="form-control">
        <label class="text-xl  text-[#160042]">I want to purchase...</label>
        <div class="relative">
          <input
            id="spend"
            type="number"
            class="input input-bordered w-full dark:bg-white dark:text-[#160042]"
            bind:value={qty}
            min="0"
            required
          />
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <!-- Heroicon name: mini/exclamation-circle -->
            <span class="font-bold">$STAMP</span>
          </div>
        </div>
      </div>
      <div class="my-4">
        <div>Current Price: {price} $bAR / $TAMP</div>
      </div>
      <div class="my-4">
        <div>Total Cost: {bar} $bAR</div>
      </div>
      <div class="my-4">
        <button
          class="btn btn-block rounded-none hover:bg-gray-400"
          type="submit">Buy</button
        >
      </div>
    </form>
  </div>
</Modal>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
    /* Firefox */
  }
</style>
