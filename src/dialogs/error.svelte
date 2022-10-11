<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";

  export let open = false;
  export let msg = "Something went wrong";
</script>

<Modal bind:open on:cancel={() => (open = false)}>
  <div class="flex flex-col space-y-8">
    <h2 class="text-2xl text-error">Error</h2>
    <p class="text-xl">
      {msg}
    </p>
  </div>
</Modal>
