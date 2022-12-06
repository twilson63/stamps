<script>
  import { format } from "date-fns";
  import { app } from "./app.js";

  export let address = "vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI";
  console.log("address", address);
</script>

{#await app.stamps(address) then stamps}
  <ul class="relative divide-y divide-gray-200 border-b border-gray-200">
    {#each stamps as stamp}
      <li
        class="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
      >
        <div class="flex items-center justify-between space-x-4">
          <div class="min-w-0 space-y-3">
            <div class="flex-none w-[600px] flex flex-col">
              <h2 class="text-xl font-bold">
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://arweave.net/{stamp.id}">{stamp.title}</a
                >
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
                class="ml-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
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
