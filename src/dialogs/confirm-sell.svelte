<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";

  export let open = false;
</script>

<Modal bind:open on:cancel={() => (open = false)}>
  <div class="flex flex-col space-y-8">
    <h2 class="text-2xl text-success">Success</h2>
    <p class="text-xl">
      You have successfully listed your $STAMP COIN rewards to exchange with
      $BAR.
    </p>
  </div>
</Modal>
