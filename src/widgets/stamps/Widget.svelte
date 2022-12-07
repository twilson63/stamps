<script>
  import ArrowOut from "./arrow-out.svelte";
  import { format } from "date-fns";
  import { app } from "./app.js";

  export let address = "vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI";
  console.log("address", address);
</script>

{#await app.stamps(address) then stamps}
  <ul class="relative divide-y divide-gray-200 border-b border-gray-200">
    {#each stamps as stamp}
      <li class="relative pl-4 pr-6 py-5 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6">
        <div class="flex items-center justify-between space-x-4">
          <div class="min-w-0 space-y-3">
            <div class="flex-none w-[600px] flex flex-col">
              <h2 class="text-xl font-bold">
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://arweave.net/{stamp.id}"
                  class="flex"
                >
                  <span>{stamp.title}</span>
                  <span class="ml-4"><ArrowOut /></span>
                </a>
              </h2>
              <p class="text-[12px]">
                {stamp.description}
              </p>
            </div>
          </div>
          <div class="hidden flex-none md:flex flex-col">
            <p class="text-[12px] font-bold">Asset:</p>
            <p class="text-[12px] flex space-x-4">
              <span>{stamp.id}</span>
              <a
                rel="noreferrer"
                href="https://warp_hyper.arweave.dev/#/read/{stamp.id}"
                target="_blank"
                class="ml-2"><ArrowOut /></a
              >
            </p>
          </div>
          <div class="hidden flex-none md:flex flex-col">
            <p class="text-[12px] font-bold">Stamps:</p>
            <p class="text-[12px] text-center">
              {stamp.count}
            </p>
          </div>
          <div class="hidden flex-none md:flex flex-col">
            <p class="text-[12px] font-bold">Stamped:</p>
            <p class="text-[12px]">
              {format(new Date(stamp.timestamp), "M/dd/yyyy h:m aaa")}
            </p>
          </div>
        </div>
      </li>
    {/each}
  </ul>
{/await}
