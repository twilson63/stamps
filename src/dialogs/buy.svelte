<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";

  export let open;
  const dispatch = createEventDispatcher();
  let bar = 0;
  let price = 0;
  let setPrice = false;
</script>

<Modal
  bind:open
  bgColor="bg-white"
  border="border-4 border-[#929292]"
  cancel={true}
  on:cancel={() => (open = false)}
>
  <div class="px-[36px] py-[24px] flex flex-col space-y-8">
    <img class="h-[55px] w-[55px]" src="assets/wallet.svg" alt="wallet" />
    <h2 class="text-2xl font-bold text-[#160042]">Purchase $TAMP with $bAR</h2>
    <form>
      <div class="form-control">
        <label class="text-xl  text-[#160042]">I will spend...</label>
        <div class="relative">
          <input
            id="spend"
            type="text"
            class="input input-bordered w-full"
            bind:value={bar}
          />
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <!-- Heroicon name: mini/exclamation-circle -->
            <span class="font-bold">$bAR</span>
          </div>
        </div>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Set Price</span>
          <input type="checkbox" bind:checked={setPrice} class="checkbox" />
        </label>
      </div>
      {#if setPrice}
        <div class="form-control">
          <label class="text-xl  text-[#160042]">Price in $bAR</label>
          <div class="relative">
            <input
              id="spend"
              type="text"
              class="input input-bordered w-full"
              bind:value={price}
            />
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <!-- Heroicon name: mini/exclamation-circle -->
              <span class="font-bold">$bAR</span>
            </div>
          </div>
        </div>
      {/if}
      <div class="my-4">
        <button
          class="btn btn-block rounded-full hover:bg-gray-400"
          on:click={() => null}>Create Buy Order</button
        >
      </div>
    </form>
  </div>
</Modal>
