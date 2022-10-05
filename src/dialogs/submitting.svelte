<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";

  let open = false;
</script>

<Modal bind:open cancel={false}>
  <p>Submitting...</p>
</Modal>
